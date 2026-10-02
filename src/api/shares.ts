import { z } from 'zod';
import { buildProviderView, defaultShareSettings } from '@/helpers/shares';
import { matterDashboardSchema, matterDetailSchema } from '@/types/matters';
import {
  notifyPrefsSchema,
  providerUserSchema,
  shareSchema,
  shareSettingsSchema,
  type NotifyPrefs,
  type ProviderSection,
  type ProviderUser,
  type ProviderView,
  type Share,
  type ShareEvent,
  type ShareSettings,
} from '@/types/shares';
import { sampleFirm } from './sample/firm';
import { sampleMatterDetails } from './sample/matterDetails';
import { sampleDashboard } from './sample/matters';
import {
  CURRENT_USER_NAME,
  sampleProviderUsers,
  sampleShareSeeds,
  seedExpiresAt,
  seedPublishedAt,
} from './sample/shares';

// Prototype backend: shares live in localStorage so the provider view, opened
// in another tab, sees what the firm published. Replace with Supabase tables.
const STORAGE_KEY = 'case-digest:shares:v2';
const PREFS_KEY = 'case-digest:provider-prefs:v1';
const LATENCY_MS = 300;

const storeSchema = z.record(z.string(), shareSchema);
type ShareStore = z.infer<typeof storeSchema>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const keyOf = (matterId: string, providerId: string) => `${matterId}:${providerId}`;

function seed(): ShareStore {
  const now = Date.now();
  const matters = matterDashboardSchema.parse(sampleDashboard).matters;
  const details = z.array(matterDetailSchema).parse(sampleMatterDetails);
  const store: ShareStore = {};
  for (const seedShare of sampleShareSeeds) {
    const matter = matters.find((m) => m.id === seedShare.matterId);
    const detail = details.find((d) => d.matterId === seedShare.matterId);
    const provider = detail?.providers.find((p) => p.id === seedShare.providerId);
    if (!matter || !detail || !provider) continue;
    const history = seedShare.publishedDaysAgo.map((daysAgo, i) => {
      const settings = shareSettingsSchema.parse({
        ...defaultShareSettings(now, seedShare.recipientIds),
        expiresAt: seedExpiresAt,
        ...seedShare.versionOverrides[i],
      });
      const view = buildProviderView({ firmName: sampleFirm.name, matter, detail, provider, settings, now });
      return { version: i + 1, publishedAt: seedPublishedAt(daysAgo), settings, view };
    });
    const published = history[history.length - 1];
    const activity: ShareEvent[] = history.map((v) => ({
      id: `${seedShare.matterId}-${seedShare.providerId}-pub-${v.version}`,
      at: v.publishedAt,
      event: 'Published',
      version: v.version,
      who: CURRENT_USER_NAME,
    }));
    const opened = seedShare.opened ? seedPublishedAt(seedShare.opened.daysAgo) : null;
    if (seedShare.opened && opened) {
      // The provider last opened the version before the latest, so they see "Updated".
      const openedVersion = Math.max(1, history.length - 1);
      activity.push({
        id: `${seedShare.matterId}-${seedShare.providerId}-open`,
        at: opened,
        event: 'Opened by provider',
        version: openedVersion,
        who: seedShare.opened.by,
      });
    }
    store[keyOf(seedShare.matterId, seedShare.providerId)] = {
      matterId: seedShare.matterId,
      providerId: seedShare.providerId,
      draft: published.settings,
      published,
      history,
      revokedAt: null,
      openedVersion: seedShare.opened ? Math.max(1, history.length - 1) : null,
      openedAt: opened,
      activity,
      sectionViews: [],
    };
  }
  return store;
}

function load(): ShareStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return storeSchema.parse(JSON.parse(raw));
  } catch {
    // Corrupt or blocked storage: fall back to the seed.
  }
  const seeded = seed();
  save(seeded);
  return seeded;
}

function save(store: ShareStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage blocked: changes last until reload.
  }
}

function emptyShare(matterId: string, providerId: string): Share {
  return {
    matterId,
    providerId,
    draft: null,
    published: null,
    history: [],
    revokedAt: null,
    openedVersion: null,
    openedAt: null,
    activity: [],
    sectionViews: [],
  };
}

async function update(matterId: string, providerId: string, change: (share: Share) => Share): Promise<Share> {
  await wait(LATENCY_MS);
  const store = load();
  const key = keyOf(matterId, providerId);
  const next = shareSchema.parse(change(store[key] ?? emptyShare(matterId, providerId)));
  save({ ...store, [key]: next });
  return next;
}

const event = (share: Share, kind: ShareEvent['event'], version: number, who: string): ShareEvent => ({
  id: `${share.matterId}-${share.providerId}-${Date.now()}-${share.activity.length}`,
  at: new Date().toISOString(),
  event: kind,
  version,
  who,
});

/** Every share on a matter, one per provider that has ever had one. */
export async function getMatterShares(matterId: string): Promise<Share[]> {
  await wait(LATENCY_MS);
  return Object.values(load()).filter((share) => share.matterId === matterId);
}

export async function getProviderUsers(providerId: string): Promise<ProviderUser[]> {
  const sampleUsers = z
    .array(providerUserSchema)
    .parse(sampleProviderUsers)
    .filter((user) => user.providerId === providerId);
  if (sampleUsers.length > 0) return sampleUsers;
  // Practices synced from Clio have no staff on record. One stand-in inbox
  // receives the share until provider_users exist (they need sign-in).
  return [providerUserSchema.parse({ id: `inbox-${providerId}`, providerId, name: 'Records desk', role: 'Practice inbox' })];
}

/** Keeps the settings only. The provider sees nothing new. */
export function saveShareDraft(matterId: string, providerId: string, settings: ShareSettings) {
  return update(matterId, providerId, (share) => ({ ...share, draft: settings }));
}

/**
 * Publishes the next version with its frozen provider view. Notification is
 * simulated by the caller.
 */
export function publishShare(matterId: string, providerId: string, settings: ShareSettings, view: ProviderView) {
  return update(matterId, providerId, (share) => {
    const version = (share.published?.version ?? 0) + 1;
    const published = { version, publishedAt: new Date().toISOString(), settings, view };
    return {
      ...share,
      draft: settings,
      published,
      history: [...share.history, published],
      revokedAt: null,
      activity: [...share.activity, event(share, 'Published', version, CURRENT_USER_NAME)],
    };
  });
}

export function revokeShare(matterId: string, providerId: string) {
  return update(matterId, providerId, (share) => ({
    ...share,
    revokedAt: new Date().toISOString(),
    activity: [...share.activity, event(share, 'Access revoked', share.published?.version ?? 1, CURRENT_USER_NAME)],
  }));
}

/** Records a provider opening the current version. The caller dedupes per session. */
export function recordShareOpened(matterId: string, providerId: string, viewerName: string) {
  return update(matterId, providerId, (share) => {
    if (!share.published) return share;
    return {
      ...share,
      openedVersion: share.published.version,
      openedAt: new Date().toISOString(),
      activity: [...share.activity, event(share, 'Opened by provider', share.published.version, viewerName)],
    };
  });
}

/** Records the first time a section of the current version was scrolled into view. */
export function recordSectionViewed(matterId: string, providerId: string, section: ProviderSection) {
  return update(matterId, providerId, (share) => {
    const version = share.published?.version;
    if (!version || share.sectionViews.some((v) => v.section === section && v.version === version)) return share;
    return { ...share, sectionViews: [...share.sectionViews, { section, version, at: new Date().toISOString() }] };
  });
}

// --- Provider alert preferences ---------------------------------------------

const prefsStoreSchema = z.record(z.string(), notifyPrefsSchema);
const NO_ALERTS: NotifyPrefs = { milestone: false, status: false, request: false };

function loadPrefs(): z.infer<typeof prefsStoreSchema> {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return prefsStoreSchema.parse(JSON.parse(raw));
  } catch {
    // Fall through to no saved preferences.
  }
  return {};
}

export async function getNotifyPrefs(matterId: string, providerId: string): Promise<NotifyPrefs> {
  return loadPrefs()[keyOf(matterId, providerId)] ?? NO_ALERTS;
}

export async function saveNotifyPrefs(matterId: string, providerId: string, prefs: NotifyPrefs): Promise<NotifyPrefs> {
  await wait(LATENCY_MS);
  const next = notifyPrefsSchema.parse(prefs);
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...loadPrefs(), [keyOf(matterId, providerId)]: next }));
  } catch {
    throw new Error('Your browser blocked saving this preference.');
  }
  return next;
}
