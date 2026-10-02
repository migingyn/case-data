// Fabricated provider practice users and the shares that already exist when
// the prototype first loads. No real people or practices.
import { ago, ahead, DAY } from './helpers';

/** The signed-in firm user, recorded as "who" on firm-side share events. */
export const CURRENT_USER_NAME = 'Jordan Lee';

export const sampleProviderUsers = [
  { id: 'u-1', providerId: 'p-okafor', name: 'Dr. Nkem Okafor', role: 'Physician' },
  { id: 'u-2', providerId: 'p-okafor', name: 'Rosa Diaz', role: 'Billing manager' },
  { id: 'u-3', providerId: 'p-bayview', name: 'Kim Tran', role: 'Office manager' },
  { id: 'u-4', providerId: 'p-bayview', name: 'Sam Ortiz', role: 'Physical therapist' },
  { id: 'u-5', providerId: 'p-coastal', name: 'Priya Shah', role: 'Records clerk' },
  { id: 'u-6', providerId: 'p-riverside', name: 'Dr. Alan Brooks', role: 'Neurosurgeon' },
  { id: 'u-7', providerId: 'p-riverside', name: 'Tess Moreno', role: 'Lien coordinator' },
  { id: 'u-8', providerId: 'p-lakeside', name: 'Gina Park', role: 'Front desk' },
  { id: 'u-9', providerId: 'p-summit', name: 'Dr. Lena Fox', role: 'Neuropsychologist' },
  { id: 'u-10', providerId: 'p-summit', name: 'Owen Hale', role: 'Office manager' },
  { id: 'u-11', providerId: 'p-harbor', name: 'Marco Ruiz', role: 'Lien coordinator' },
  { id: 'u-12', providerId: 'p-harbor', name: 'Dr. Ivy Chen', role: 'Orthopedic surgeon' },
  { id: 'u-13', providerId: 'p-cityuc', name: 'Lee Adams', role: 'Records clerk' },
];

const baseSettings = (recipientIds: string[]) => ({
  status: true,
  coverage: true,
  coverageLevel: 'indicator',
  milestones: true,
  treatment: true,
  requests: true,
  summary: false,
  documents: false,
  documentPages: {},
  expiresAt: ahead(80 * DAY),
  recipientIds,
});

function publishedShare(
  matterId: string,
  providerId: string,
  recipientIds: string[],
  publishes: number[],
  opened: { daysAgo: number; by: string } | null,
) {
  const version = publishes.length;
  const settings = baseSettings(recipientIds);
  const activity = publishes.map((days, i) => ({
    id: `${matterId}-${providerId}-pub-${i + 1}`,
    at: ago(days * DAY),
    event: 'Published',
    version: i + 1,
    who: CURRENT_USER_NAME,
  }));
  if (opened) {
    activity.push({
      id: `${matterId}-${providerId}-open`,
      at: ago(opened.daysAgo * DAY),
      event: 'Opened by provider',
      version,
      who: opened.by,
    });
  }
  return {
    matterId,
    providerId,
    draft: settings,
    published: { version, publishedAt: ago(publishes[version - 1] * DAY), settings },
    revokedAt: null,
    openedVersion: opened ? version : null,
    openedAt: opened ? ago(opened.daysAgo * DAY) : null,
    activity,
  };
}

export const sampleShares = [
  publishedShare('m-1042', 'p-okafor', ['u-1', 'u-2'], [20, 3], { daysAgo: 1, by: 'Rosa Diaz' }),
  publishedShare('m-1042', 'p-bayview', ['u-3'], [5], null),
  publishedShare('m-1018', 'p-riverside', ['u-7'], [12], { daysAgo: 9, by: 'Tess Moreno' }),
  publishedShare('m-1018', 'p-summit', ['u-10'], [4], null),
  publishedShare('m-1037', 'p-harbor', ['u-11'], [40, 25, 6], { daysAgo: 4, by: 'Marco Ruiz' }),
];
