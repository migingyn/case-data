import { z } from 'zod';
import {
  providerUserSchema,
  shareSchema,
  type ProviderUser,
  type Share,
  type ShareEvent,
  type ShareSettings,
} from '@/types/shares';
import { CURRENT_USER_NAME, sampleProviderUsers, sampleShares } from './sample/shares';

// Prototype backend: shares live in localStorage so the provider view, opened
// in another tab, sees what the firm published. Replace with Supabase tables.
const STORAGE_KEY = 'case-digest:shares:v1';
const LATENCY_MS = 300;

const storeSchema = z.record(z.string(), shareSchema);
type ShareStore = z.infer<typeof storeSchema>;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const keyOf = (matterId: string, providerId: string) => `${matterId}:${providerId}`;

function seed(): ShareStore {
  const shares = z.array(shareSchema).parse(sampleShares);
  return Object.fromEntries(shares.map((share) => [keyOf(share.matterId, share.providerId), share]));
}

function load(): ShareStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return storeSchema.parse(JSON.parse(raw));
  } catch {
    // Corrupt or blocked storage: fall back to the seed.
  }
  return seed();
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
    revokedAt: null,
    openedVersion: null,
    openedAt: null,
    activity: [],
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
  id: `${share.matterId}-${share.providerId}-${Date.now()}`,
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
  return z
    .array(providerUserSchema)
    .parse(sampleProviderUsers)
    .filter((user) => user.providerId === providerId);
}

/** Keeps the settings only. The provider sees nothing new. */
export function saveShareDraft(matterId: string, providerId: string, settings: ShareSettings) {
  return update(matterId, providerId, (share) => ({ ...share, draft: settings }));
}

/** Publishes the next version and records it. Notification is simulated. */
export function publishShare(matterId: string, providerId: string, settings: ShareSettings) {
  return update(matterId, providerId, (share) => {
    const version = (share.published?.version ?? 0) + 1;
    return {
      ...share,
      draft: settings,
      published: { version, publishedAt: new Date().toISOString(), settings },
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

/** Called from the provider view the first time a version is opened. */
export function recordShareOpened(matterId: string, providerId: string, viewerName: string) {
  return update(matterId, providerId, (share) => {
    if (!share.published || share.openedVersion === share.published.version) return share;
    return {
      ...share,
      openedVersion: share.published.version,
      openedAt: new Date().toISOString(),
      activity: [...share.activity, event(share, 'Opened by provider', share.published.version, viewerName)],
    };
  });
}
