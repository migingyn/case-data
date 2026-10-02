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

/** Shares that exist when the prototype first loads; views are built from the sample matters. */
export const sampleShareSeeds = [
  {
    matterId: 'm-1042', providerId: 'p-okafor', recipientIds: ['u-1', 'u-2'],
    publishedDaysAgo: [20, 3], opened: { daysAgo: 1, by: 'Rosa Diaz' },
    // Version 1 didn't include documents; version 2 added them.
    versionOverrides: [{ documents: false }, { documents: true, documentPages: { 'd-2': [1, 2], 'd-3': [1] } }],
  },
  { matterId: 'm-1042', providerId: 'p-bayview', recipientIds: ['u-3'], publishedDaysAgo: [5], opened: null, versionOverrides: [{}] },
  {
    matterId: 'm-1018', providerId: 'p-riverside', recipientIds: ['u-7'],
    publishedDaysAgo: [12], opened: { daysAgo: 9, by: 'Tess Moreno' }, versionOverrides: [{}],
  },
  { matterId: 'm-1018', providerId: 'p-summit', recipientIds: ['u-10'], publishedDaysAgo: [4], opened: null, versionOverrides: [{}] },
  {
    matterId: 'm-1037', providerId: 'p-harbor', recipientIds: ['u-11'],
    publishedDaysAgo: [40, 25, 6], opened: { daysAgo: 4, by: 'Marco Ruiz' },
    versionOverrides: [{}, { summary: true }, { summary: true, documents: true, documentPages: { 'd-2': [1, 2] } }],
  },
];

export const seedExpiresAt = ahead(80 * DAY);
export const seedPublishedAt = (daysAgo: number) => ago(daysAgo * DAY);
