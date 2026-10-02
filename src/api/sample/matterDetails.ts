// Fabricated matter detail for three sample matters. No real clients,
// providers, carriers or cases. The summary text is fixed sample copy,
// not generated.
import { ago, ahead, DAY, HOUR, source } from './helpers';

const clio = (n: number) => `https://app.clio.com/nc/#/matters/${n}`;

// --- Maria Alvarez -----------------------------------------------------------

const alvarezIntake = source('intake_form', 'Intake form', ago(41 * DAY), 'Rear-end collision on the freeway on-ramp. Client was stopped; the other driver did not brake.', { page: 1 });
const alvarezPolice = source('report', 'Police report', ago(39 * DAY), 'Driver of vehicle 2 cited for following too closely (VC 21703).', { page: 2 });
const alvarezPolicy = source('policy', 'Keystone Auto declarations', ago(30 * DAY), 'Bodily injury liability: $100,000 per person. Medical payments: $5,000.', { page: 1 });
const alvarezMedpay = source('policy', 'Keystone Auto declarations', ago(30 * DAY), 'Medical payments paid to date: $4,610 of $5,000.', { page: 3 });
const alvarezPlan = source('medical_record', 'Updated treatment plan', ago(1 * DAY), 'Recommend 8 additional weeks of physical therapy, twice weekly, then re-evaluate.', { page: 2, author: 'Dr. N. Okafor' });
const alvarezMri = source('medical_record', 'Cervical and lumbar MRI', ago(26 * DAY), 'Findings consistent with cervical and lumbar strain. No fracture or herniation.', { page: 1, author: 'Coastal Imaging' });
const alvarezIntakeNotes = source('note', 'Intake call notes', ago(41 * DAY), 'Client also mentions right shoulder pain when reaching overhead. Not yet evaluated.', { author: 'Jordan Lee' });
const alvarezMessage = source('message', 'Client portal message', ago(6 * HOUR), 'Is my physical therapy still covered after March? The clinic said they need to hear from you.', { author: 'Maria Alvarez' });
const alvarezValuation = source('memo', 'Case valuation memo', ago(6 * DAY), 'Expected $85,000; range $60,000 to $110,000 depending on length of treatment.', { page: 1, author: 'Dana Whitaker' });
const alvarezLedger = source('ledger', 'Matter cost ledger', ago(1 * DAY), 'Records, filing and courier costs advanced to date: $2,140.');
const alvarezRecordsTask = source('task', 'Task: Request imaging records', ago(7 * DAY), 'Task assigned in the source system: Request imaging records from Coastal Imaging.');
const alvarezDemandPlan = source('memo', 'Case plan', ago(20 * DAY), 'Hold the demand until treatment ends so the full medical specials are in.', { author: 'Dana Whitaker' });

const alvarez = {
  matterId: 'm-1042',
  photoUrl: null,
  openedAt: ago(41 * DAY),
  openedSource: alvarezIntake,
  leadAttorney: 'Dana Whitaker',
  sourceUrl: clio(1042),
  caseValue: { expected: 85_000, low: 60_000, high: 110_000, updatedAt: ago(6 * DAY), source: alvarezValuation },
  coverage: { limit: 100_000, carrier: 'Keystone Auto', type: 'Auto liability', verifiedAt: ago(30 * DAY), source: alvarezPolicy },
  firmSpend: { amount: 2_140, asOf: ago(1 * DAY), source: alvarezLedger },
  lastContact: { at: ago(6 * HOUR), who: 'Maria, with Jordan Lee', channel: 'Portal message', source: alvarezMessage },
  summaryAsOf: ago(2 * HOUR),
  brief: {
    whereItStands: [
      { text: 'Maria is treating for neck and lower back strain from a rear-end collision.', source: alvarezMri },
      { text: 'Liability looks clear: the other driver was cited for following too closely.', source: alvarezPolice },
      { text: 'Bodily injury coverage of $100,000 is confirmed with Keystone Auto.', source: alvarezPolicy },
    ],
    whatIsNext: [
      { text: 'Dr. Okafor recommends eight more weeks of physical therapy before re-evaluating.', source: alvarezPlan },
      { text: 'Imaging records from Coastal Imaging are due this week to complete the medical file.', source: alvarezRecordsTask },
      { text: 'The demand goes out once treatment ends, so the full medical bills are included.', source: alvarezDemandPlan },
    ],
    watchFor: [
      { text: 'Maria asked whether therapy past March is covered and is waiting on an answer.', source: alvarezMessage },
      { text: 'Med-pay is nearly used up: $4,610 of $5,000 paid.', source: alvarezMedpay },
      { text: 'A right shoulder complaint from intake has not been evaluated by any provider.', source: alvarezIntakeNotes },
    ],
  },
  rankedEntries: [
    { id: 'r-1', date: ago(39 * DAY), title: 'Police report cites the other driver', reason: 'establishes liability', source: alvarezPolice },
    { id: 'r-2', date: ago(30 * DAY), title: 'Keystone Auto policy declarations', reason: 'sets the coverage ceiling at $100,000', source: alvarezPolicy },
    { id: 'r-3', date: ago(26 * DAY), title: 'Cervical and lumbar MRI results', reason: 'objective imaging behind the injury claim', source: alvarezMri },
    { id: 'r-4', date: ago(1 * DAY), title: 'Updated treatment plan from Dr. Okafor', reason: 'extends treatment, which moves value and timing', source: alvarezPlan },
    { id: 'r-5', date: ago(6 * DAY), title: 'Case valuation memo', reason: 'the current number everyone is working from', source: alvarezValuation },
    { id: 'r-6', date: ago(6 * HOUR), title: 'Client asks about therapy coverage', reason: 'open client question with a deadline attached', source: alvarezMessage },
    { id: 'r-7', date: ago(41 * DAY), title: 'Intake form', reason: 'the client’s first account of the collision', source: alvarezIntake },
    { id: 'r-8', date: ago(41 * DAY), title: 'Intake call notes mention shoulder pain', reason: 'possible injury not yet in any record', source: alvarezIntakeNotes },
    { id: 'r-9', date: ago(30 * DAY), title: 'Med-pay nearly exhausted', reason: 'affects how the client pays for ongoing care', source: alvarezMedpay },
    { id: 'r-10', date: ago(20 * DAY), title: 'Case plan: hold demand until treatment ends', reason: 'sets the strategy for the next two months', source: alvarezDemandPlan },
  ],
  totalEntries: 186,
  injuries: [
    { id: 'i-1', description: 'Cervical strain', status: 'confirmed', source: alvarezMri },
    { id: 'i-2', description: 'Lumbar strain', status: 'confirmed', source: alvarezMri },
    { id: 'i-3', description: 'Right shoulder impingement', status: 'proposed', source: alvarezIntakeNotes },
  ],
  providers: [
    {
      id: 'p-okafor', name: 'Okafor Spine & Sports', specialty: 'Orthopedics', lienType: 'Medical lien',
      lastVisitAt: ago(1 * DAY), lastVisitSource: alvarezPlan,
    },
    {
      id: 'p-bayview', name: 'Bayview Physical Therapy', specialty: 'Physical therapy', lienType: 'Letter of protection',
      lastVisitAt: ago(2 * DAY), lastVisitSource: source('bill', 'Visit invoice, Bayview PT', ago(2 * DAY), 'Therapeutic exercise and manual therapy, 60 minutes.', { page: 1 }),
    },
    {
      id: 'p-coastal', name: 'Coastal Imaging', specialty: 'Radiology', lienType: 'Medical lien',
      lastVisitAt: ago(26 * DAY), lastVisitSource: alvarezMri,
    },
  ],
  milestones: [
    { id: 'ms-1', label: 'Collision', date: ago(42 * DAY), done: true },
    { id: 'ms-2', label: 'Firm retained', date: ago(41 * DAY), done: true },
    { id: 'ms-3', label: 'Liability accepted by insurer', date: ago(28 * DAY), done: true },
    { id: 'ms-4', label: 'Treatment complete', date: ahead(56 * DAY), done: false },
    { id: 'ms-5', label: 'Demand sent', date: ahead(70 * DAY), done: false },
  ],
  visits: [
    { id: 'v-1', providerId: 'p-okafor', date: ago(38 * DAY), status: 'attended' },
    { id: 'v-2', providerId: 'p-coastal', date: ago(26 * DAY), status: 'attended' },
    { id: 'v-3', providerId: 'p-bayview', date: ago(21 * DAY), status: 'attended' },
    { id: 'v-4', providerId: 'p-bayview', date: ago(14 * DAY), status: 'missed' },
    { id: 'v-5', providerId: 'p-bayview', date: ago(9 * DAY), status: 'attended' },
    { id: 'v-6', providerId: 'p-bayview', date: ago(2 * DAY), status: 'attended' },
    { id: 'v-7', providerId: 'p-okafor', date: ago(1 * DAY), status: 'attended' },
    { id: 'v-8', providerId: 'p-bayview', date: ahead(2 * DAY), status: 'scheduled' },
  ],
  requests: [
    { id: 'rq-1', providerId: 'p-bayview', title: 'Therapy notes for all visits to date', requestedAt: ago(8 * DAY) },
    { id: 'rq-2', providerId: 'p-bayview', title: 'Itemized billing ledger', requestedAt: ago(8 * DAY) },
    { id: 'rq-3', providerId: 'p-coastal', title: 'Radiology report and images for the MRI', requestedAt: ago(7 * DAY) },
  ],
  documents: [
    { id: 'd-1', title: 'Police report', pageCount: 4 },
    { id: 'd-2', title: 'Cervical and lumbar MRI', pageCount: 3 },
    { id: 'd-3', title: 'Updated treatment plan', pageCount: 2 },
  ],
  providerSummary: [
    'Maria is in active treatment after a rear-end collision. The other driver was cited at the scene.',
    'The insurer has accepted liability. The case will move to settlement talks once treatment ends.',
  ],
};

// --- James Whitfield ---------------------------------------------------------

const whitfieldIntake = source('intake_form', 'Intake form', ago(210 * DAY), 'Client’s sedan struck by a tractor-trailer changing lanes on the interstate.', { page: 1 });
const whitfieldComplaint = source('filing', 'Complaint for damages', ago(150 * DAY), 'Plaintiff alleges negligence and negligent supervision against the driver and carrier.', { page: 4 });
const whitfieldPolicy = source('policy', 'Great Plains Commercial policy', ago(120 * DAY), 'Commercial auto liability: $2,000,000 combined single limit.', { page: 2 });
const whitfieldSurgery = source('medical_record', 'Operative report', ago(160 * DAY), 'L4-L5 microdiscectomy performed without complication.', { page: 1, author: 'Riverside Neurosurgery' });
const whitfieldWrist = source('medical_record', 'ER discharge summary', ago(209 * DAY), 'Closed distal radius fracture, left wrist. Splinted; ortho follow-up.', { page: 2 });
const whitfieldNeuro = source('note', 'Attorney call notes', ago(18 * DAY), 'Client reports memory lapses and headaches. Neuropsych testing referral discussed.', { author: 'Marcus Bell' });
const whitfieldDepo = source('filing', 'Notice of deposition', ago(1 * DAY), 'Deposition of defendant driver to be taken October 21 at 9:00 a.m.', { page: 1 });
const whitfieldLogs = source('letter', 'Defense document production', ago(30 * HOUR), 'Enclosed are Bates DEF-0001 through DEF-0340, driver hours-of-service logs.', { page: 1, author: 'Defense counsel' });
const whitfieldExpertTask = source('task', 'Task: Serve expert disclosures', ago(7 * DAY), 'Task assigned in the source system: Serve expert disclosures.');
const whitfieldValuation = source('memo', 'Case valuation memo', ago(14 * DAY), 'Expected $950,000; range $700,000 to $1.4M depending on the brain injury finding.', { page: 1, author: 'Marcus Bell' });
const whitfieldLedger = source('ledger', 'Matter cost ledger', ago(1 * DAY), 'Expert retainers, filing fees and records advanced to date: $38,650.');
const whitfieldCall = source('call_log', 'Call log', ago(3 * DAY), 'Called client to prepare for the upcoming defense medical exam.', { author: 'Marcus Bell' });
const whitfieldHos = source('letter', 'Hours-of-service log excerpt', ago(30 * HOUR), 'Driver logged 13.5 hours on duty the day of the collision.', { page: 212 });

const whitfield = {
  matterId: 'm-1018',
  photoUrl: null,
  openedAt: ago(210 * DAY),
  openedSource: whitfieldIntake,
  leadAttorney: 'Marcus Bell',
  sourceUrl: clio(1018),
  caseValue: { expected: 950_000, low: 700_000, high: 1_400_000, updatedAt: ago(14 * DAY), source: whitfieldValuation },
  coverage: { limit: 2_000_000, carrier: 'Great Plains Commercial', type: 'Commercial auto liability', verifiedAt: ago(120 * DAY), source: whitfieldPolicy },
  firmSpend: { amount: 38_650, asOf: ago(1 * DAY), source: whitfieldLedger },
  lastContact: { at: ago(3 * DAY), who: 'James, with Marcus Bell', channel: 'Phone call', source: whitfieldCall },
  summaryAsOf: ago(3 * HOUR),
  brief: {
    whereItStands: [
      { text: 'The case is in litigation against the driver and the trucking carrier.', source: whitfieldComplaint },
      { text: 'James had back surgery for a herniated disc and has recovered from a wrist fracture.', source: whitfieldSurgery },
      { text: 'There is $2,000,000 in commercial coverage behind the claim.', source: whitfieldPolicy },
    ],
    whatIsNext: [
      { text: 'Expert disclosures are due tomorrow.', source: whitfieldExpertTask },
      { text: 'The defendant driver’s deposition is set for October 21.', source: whitfieldDepo },
    ],
    watchFor: [
      { text: 'The new logbooks show the driver was on duty 13.5 hours the day of the crash.', source: whitfieldHos },
      { text: 'A possible brain injury is not yet confirmed; it is the biggest swing in value.', source: whitfieldNeuro },
    ],
  },
  rankedEntries: [
    { id: 'r-1', date: ago(30 * HOUR), title: 'Driver on duty 13.5 hours before the crash', reason: 'hours-of-service violation supports negligent supervision', source: whitfieldHos },
    { id: 'r-2', date: ago(160 * DAY), title: 'Operative report: L4-L5 microdiscectomy', reason: 'surgery drives the value of the claim', source: whitfieldSurgery },
    { id: 'r-3', date: ago(150 * DAY), title: 'Complaint filed', reason: 'defines the claims and parties', source: whitfieldComplaint },
    { id: 'r-4', date: ago(120 * DAY), title: 'Commercial policy confirmed at $2M', reason: 'sets the coverage ceiling', source: whitfieldPolicy },
    { id: 'r-5', date: ago(1 * DAY), title: 'Deposition of defendant driver noticed', reason: 'next major event in discovery', source: whitfieldDepo },
    { id: 'r-6', date: ago(18 * DAY), title: 'Client reports memory lapses', reason: 'possible brain injury could raise value sharply', source: whitfieldNeuro },
    { id: 'r-7', date: ago(14 * DAY), title: 'Case valuation memo', reason: 'the current number everyone is working from', source: whitfieldValuation },
    { id: 'r-8', date: ago(209 * DAY), title: 'ER discharge: left wrist fracture', reason: 'second objectively documented injury', source: whitfieldWrist },
    { id: 'r-9', date: ago(30 * HOUR), title: 'Defense produces 340 pages of logs', reason: 'the source of the hours-of-service finding', source: whitfieldLogs },
    { id: 'r-10', date: ago(210 * DAY), title: 'Intake form', reason: 'the client’s first account of the collision', source: whitfieldIntake },
  ],
  totalEntries: 742,
  injuries: [
    { id: 'i-1', description: 'L4-L5 disc herniation, surgically repaired', status: 'confirmed', source: whitfieldSurgery },
    { id: 'i-2', description: 'Left distal radius fracture', status: 'confirmed', source: whitfieldWrist },
    { id: 'i-3', description: 'Mild traumatic brain injury', status: 'proposed', source: whitfieldNeuro },
  ],
  providers: [
    {
      id: 'p-riverside', name: 'Riverside Neurosurgery', specialty: 'Neurosurgery', lienType: 'Medical lien',
      lastVisitAt: ago(21 * DAY), lastVisitSource: source('medical_record', 'Post-op follow-up', ago(21 * DAY), 'Healing well. Cleared for light duty.', { page: 1 }),
    },
    {
      id: 'p-lakeside', name: 'Lakeside Hand Center', specialty: 'Hand surgery', lienType: 'Health insurance',
      lastVisitAt: ago(95 * DAY), lastVisitSource: source('medical_record', 'Discharge from care', ago(95 * DAY), 'Fracture healed. Full range of motion. Discharged.', { page: 1 }),
    },
    {
      id: 'p-summit', name: 'Summit Neuropsychology', specialty: 'Neuropsychology', lienType: 'Letter of protection',
      lastVisitAt: ago(5 * DAY), lastVisitSource: source('bill', 'Intake invoice, Summit', ago(5 * DAY), 'New patient consultation. Testing scheduled.', { page: 1 }),
    },
  ],
  milestones: [
    { id: 'ms-1', label: 'Collision', date: ago(211 * DAY), done: true },
    { id: 'ms-2', label: 'Firm retained', date: ago(210 * DAY), done: true },
    { id: 'ms-3', label: 'Lawsuit filed', date: ago(150 * DAY), done: true },
    { id: 'ms-4', label: 'Defendant driver deposition', date: ahead(19 * DAY), done: false },
    { id: 'ms-5', label: 'Mediation', date: ahead(45 * DAY), done: false },
  ],
  visits: [
    { id: 'v-1', providerId: 'p-lakeside', date: ago(200 * DAY), status: 'attended' },
    { id: 'v-2', providerId: 'p-riverside', date: ago(160 * DAY), status: 'attended' },
    { id: 'v-3', providerId: 'p-lakeside', date: ago(95 * DAY), status: 'attended' },
    { id: 'v-4', providerId: 'p-riverside', date: ago(60 * DAY), status: 'missed' },
    { id: 'v-5', providerId: 'p-riverside', date: ago(21 * DAY), status: 'attended' },
    { id: 'v-6', providerId: 'p-summit', date: ago(5 * DAY), status: 'attended' },
    { id: 'v-7', providerId: 'p-summit', date: ahead(9 * DAY), status: 'scheduled' },
  ],
  requests: [
    { id: 'rq-1', providerId: 'p-summit', title: 'Neuropsychological testing report when complete', requestedAt: ago(5 * DAY) },
  ],
  documents: [
    { id: 'd-1', title: 'Operative report', pageCount: 3 },
    { id: 'd-2', title: 'ER discharge summary', pageCount: 4 },
    { id: 'd-3', title: 'Notice of deposition', pageCount: 2 },
  ],
  providerSummary: [
    'James was hit by a commercial truck. The case is in litigation and moving through discovery.',
    'His spine surgery and wrist fracture are documented. Testing for a possible brain injury is underway.',
  ],
};

// --- Devon Brooks ------------------------------------------------------------

const brooksIntake = source('intake_form', 'Intake form', ago(150 * DAY), 'Client slipped on spilled liquid in the produce aisle. No warning sign.', { page: 1 });
const brooksIncident = source('report', 'Store incident report', ago(148 * DAY), 'Spill reported 25 minutes before the fall; cleanup not yet dispatched.', { page: 1 });
const brooksPolicy = source('policy', 'Pacific Mutual general liability', ago(60 * DAY), 'Per-occurrence limit: $50,000.', { page: 1 });
const brooksMri = source('medical_record', 'Right knee MRI', ago(120 * DAY), 'Complex tear of the medial meniscus, posterior horn.', { page: 1, author: 'Harbor Orthopedics' });
const brooksUrgent = source('medical_record', 'Urgent care visit', ago(149 * DAY), 'Left wrist sprain. Ace wrap; follow up as needed.', { page: 1, author: 'City Urgent Care' });
const brooksOffer = source('letter', 'Counteroffer from Pacific Mutual', ago(20 * HOUR), 'We are prepared to resolve this claim for $42,000, inclusive of all liens.', { page: 1, author: 'Pacific Mutual claims' });
const brooksDemand = source('letter', 'Demand letter', ago(34 * DAY), 'Demand for the $50,000 policy limit, open for 30 days.', { page: 6 });
const brooksValuation = source('memo', 'Case valuation memo', ago(9 * DAY), 'Expected $120,000; recovery capped by the $50,000 policy unless excess exposure develops.', { page: 1, author: 'Dana Whitaker' });
const brooksLedger = source('ledger', 'Matter cost ledger', ago(2 * DAY), 'Records and courier costs advanced to date: $4,320.');
const brooksCall = source('call_log', 'Call log', ago(9 * DAY), 'Updated client on the demand. Client wants to settle before the holidays.', { author: 'Jordan Lee' });
const brooksLien = source('task', 'Task: Lien reduction from Harbor Orthopedics', ago(7 * DAY), 'Task assigned in the source system: Lien reduction from Harbor Orthopedics.');

const brooks = {
  matterId: 'm-1037',
  photoUrl: null,
  openedAt: ago(150 * DAY),
  openedSource: brooksIntake,
  leadAttorney: 'Dana Whitaker',
  sourceUrl: clio(1037),
  caseValue: { expected: 120_000, low: 80_000, high: 150_000, updatedAt: ago(9 * DAY), source: brooksValuation },
  coverage: { limit: 50_000, carrier: 'Pacific Mutual', type: 'General liability', verifiedAt: ago(60 * DAY), source: brooksPolicy },
  firmSpend: { amount: 4_320, asOf: ago(2 * DAY), source: brooksLedger },
  lastContact: { at: ago(9 * DAY), who: 'Devon, with Jordan Lee', channel: 'Phone call', source: brooksCall },
  summaryAsOf: ago(1 * HOUR),
  brief: {
    whereItStands: [
      { text: 'Devon tore the meniscus in his right knee in a fall at a grocery store.', source: brooksMri },
      { text: 'The store knew about the spill 25 minutes before the fall.', source: brooksIncident },
      { text: 'We demanded the $50,000 policy limit.', source: brooksDemand },
    ],
    whatIsNext: [
      { text: 'The insurer countered at $42,000; a response is due in two days.', source: brooksOffer },
      { text: 'A lien reduction from Harbor Orthopedics would raise Devon’s net recovery.', source: brooksLien },
    ],
    watchFor: [
      { text: 'Damages exceed the policy limit, so the ceiling is $50,000 unless excess exposure develops.', source: brooksValuation },
      { text: 'Devon wants to settle before the holidays.', source: brooksCall },
    ],
  },
  rankedEntries: [
    { id: 'r-1', date: ago(20 * HOUR), title: 'Insurer counters at $42,000', reason: 'live offer with a response deadline', source: brooksOffer },
    { id: 'r-2', date: ago(148 * DAY), title: 'Store incident report', reason: 'shows the store knew about the spill', source: brooksIncident },
    { id: 'r-3', date: ago(120 * DAY), title: 'Right knee MRI: meniscus tear', reason: 'objective proof of the main injury', source: brooksMri },
    { id: 'r-4', date: ago(60 * DAY), title: 'Policy limit confirmed at $50,000', reason: 'caps the realistic recovery', source: brooksPolicy },
    { id: 'r-5', date: ago(34 * DAY), title: 'Policy-limits demand sent', reason: 'starts the negotiation clock', source: brooksDemand },
    { id: 'r-6', date: ago(9 * DAY), title: 'Case valuation memo', reason: 'the current number everyone is working from', source: brooksValuation },
    { id: 'r-7', date: ago(9 * DAY), title: 'Client wants to settle soon', reason: 'shapes how hard to push on the counter', source: brooksCall },
    { id: 'r-8', date: ago(149 * DAY), title: 'Urgent care: left wrist sprain', reason: 'second injury from the same fall', source: brooksUrgent },
    { id: 'r-9', date: ago(150 * DAY), title: 'Intake form', reason: 'the client’s first account of the fall', source: brooksIntake },
  ],
  totalEntries: 214,
  injuries: [
    { id: 'i-1', description: 'Right medial meniscus tear', status: 'confirmed', source: brooksMri },
    { id: 'i-2', description: 'Left wrist sprain', status: 'confirmed', source: brooksUrgent },
  ],
  providers: [
    {
      id: 'p-harbor', name: 'Harbor Orthopedics', specialty: 'Orthopedics', lienType: 'Medical lien',
      lastVisitAt: ago(18 * DAY), lastVisitSource: source('bill', 'Visit invoice, Harbor Ortho', ago(18 * DAY), 'Follow-up visit, knee injection.', { page: 1 }),
    },
    {
      id: 'p-cityuc', name: 'City Urgent Care', specialty: 'Urgent care', lienType: 'Health insurance',
      lastVisitAt: ago(149 * DAY), lastVisitSource: brooksUrgent,
    },
  ],
  milestones: [
    { id: 'ms-1', label: 'Fall at store', date: ago(151 * DAY), done: true },
    { id: 'ms-2', label: 'Firm retained', date: ago(150 * DAY), done: true },
    { id: 'ms-3', label: 'Demand sent', date: ago(34 * DAY), done: true },
    { id: 'ms-4', label: 'Settlement', date: ahead(30 * DAY), done: false },
  ],
  visits: [
    { id: 'v-1', providerId: 'p-cityuc', date: ago(149 * DAY), status: 'attended' },
    { id: 'v-2', providerId: 'p-harbor', date: ago(120 * DAY), status: 'attended' },
    { id: 'v-3', providerId: 'p-harbor', date: ago(75 * DAY), status: 'attended' },
    { id: 'v-4', providerId: 'p-harbor', date: ago(46 * DAY), status: 'missed' },
    { id: 'v-5', providerId: 'p-harbor', date: ago(18 * DAY), status: 'attended' },
  ],
  requests: [
    { id: 'rq-1', providerId: 'p-harbor', title: 'Written agreement on the lien reduction', requestedAt: ago(6 * DAY) },
  ],
  documents: [
    { id: 'd-1', title: 'Store incident report', pageCount: 2 },
    { id: 'd-2', title: 'Right knee MRI', pageCount: 2 },
  ],
  providerSummary: [
    'Devon tore the meniscus in his right knee in a fall at a grocery store.',
    'The case is in settlement talks with the store’s insurer.',
  ],
};

export const sampleMatterDetails = [alvarez, whitfield, brooks];
