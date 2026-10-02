// Fabricated sample matters. No real clients, providers or cases.
// Times are relative to when the app loaded so the dashboard always has
// something "new" to show. Swap getMatterDashboard to Supabase when the
// matters tables land.

import { ago, ahead, DAY, HOUR, source } from './helpers';

export const sampleDashboard = {
  lastVisitAt: ago(2 * DAY),
  matters: [
    {
      id: 'm-1042',
      clientName: 'Maria Alvarez',
      caseType: 'Auto collision, rear-end',
      stage: 'Treatment',
      lastClientContactAt: ago(6 * HOUR),
      estimatedValue: 85_000,
      coverageLimit: 100_000,
      activity: [
        { id: 'a-1', kind: 'client_message', summary: 'Asked whether physical therapy past March is covered', occurredAt: ago(6 * HOUR), source: source('message', 'Client portal message', ago(6 * HOUR), 'Is my physical therapy still covered after March? The clinic said they need to hear from you.', { author: 'Maria Alvarez' }) },
        { id: 'a-2', kind: 'provider_reply', summary: 'Dr. Okafor sent an updated treatment plan', occurredAt: ago(1 * DAY), source: source('medical_record', 'Updated treatment plan', ago(1 * DAY), 'Recommend 8 additional weeks of physical therapy, twice weekly, then re-evaluate.', { page: 2, author: 'Dr. N. Okafor' }) },
        { id: 'a-3', kind: 'note', summary: 'Intake call notes filed', occurredAt: ago(5 * DAY), source: source('note', 'Intake call notes', ago(5 * DAY), 'Client reports neck and lower back pain since the collision. Treating with Dr. Okafor.', { author: 'Jordan Lee' }) },
      ],
      tasks: [
        { id: 't-1', title: 'Request imaging records from Coastal Imaging', dueAt: ahead(3 * DAY), done: false, waitingOn: null, source: source('task', 'Task: Request imaging records from Coastal Imaging', ago(7 * DAY), 'Task assigned in the source system: Request imaging records from Coastal Imaging.') },
      ],
    },
    {
      id: 'm-1037',
      clientName: 'Devon Brooks',
      caseType: 'Slip and fall, grocery store',
      stage: 'Demand',
      lastClientContactAt: ago(9 * DAY),
      estimatedValue: 120_000,
      coverageLimit: 50_000,
      activity: [
        { id: 'a-4', kind: 'offer', summary: 'Insurer countered the demand at $42,000', occurredAt: ago(20 * HOUR), source: source('letter', 'Counteroffer from Pacific Mutual', ago(20 * HOUR), 'We are prepared to resolve this claim for $42,000, inclusive of all liens.', { page: 1, author: 'Pacific Mutual claims' }) },
        { id: 'a-5', kind: 'email', summary: 'Adjuster confirmed receipt of the demand packet', occurredAt: ago(4 * DAY), source: source('email', 'Demand packet received', ago(4 * DAY), 'Confirming receipt of your demand and enclosures. We will respond within 30 days.', { author: 'Adjuster, Pacific Mutual' }) },
      ],
      tasks: [
        { id: 't-2', title: 'Respond to counteroffer', dueAt: ahead(2 * DAY), done: false, waitingOn: null, source: source('task', 'Task: Respond to counteroffer', ago(7 * DAY), 'Task assigned in the source system: Respond to counteroffer.') },
        { id: 't-3', title: 'Lien reduction from Harbor Orthopedics', dueAt: ahead(4 * DAY), done: false, waitingOn: 'Harbor Orthopedics', source: source('task', 'Task: Lien reduction from Harbor Orthopedics', ago(7 * DAY), 'Task assigned in the source system: Lien reduction from Harbor Orthopedics.') },
      ],
    },
    {
      id: 'm-1029',
      clientName: 'Priya Raman',
      caseType: 'Dog bite',
      stage: 'Intake',
      lastClientContactAt: ago(21 * DAY),
      estimatedValue: 30_000,
      coverageLimit: 300_000,
      activity: [
        { id: 'a-6', kind: 'note', summary: 'Homeowner policy identified', occurredAt: ago(8 * DAY), source: source('note', 'Coverage research', ago(8 * DAY), 'Dog owner has a homeowner policy; carrier identified from the incident report.', { author: 'Jordan Lee' }) },
      ],
      tasks: [
        { id: 't-4', title: 'Collect signed medical authorization', dueAt: ago(2 * DAY), done: false, waitingOn: null, source: source('task', 'Task: Collect signed medical authorization', ago(7 * DAY), 'Task assigned in the source system: Collect signed medical authorization.') },
      ],
    },
    {
      id: 'm-1018',
      clientName: 'James Whitfield',
      caseType: 'Commercial truck collision',
      stage: 'Litigation',
      lastClientContactAt: ago(3 * DAY),
      estimatedValue: 950_000,
      coverageLimit: 2_000_000,
      activity: [
        { id: 'a-7', kind: 'court_date', summary: 'Deposition of the defendant driver set for Oct 21', occurredAt: ago(1 * DAY), source: source('filing', 'Notice of deposition', ago(1 * DAY), 'Deposition of defendant driver to be taken October 21 at 9:00 a.m.', { page: 1 }) },
        { id: 'a-8', kind: 'document', summary: 'Defense produced 340 pages of driver logbooks', occurredAt: ago(30 * HOUR), source: source('letter', 'Defense document production', ago(30 * HOUR), 'Enclosed are Bates DEF-0001 through DEF-0340, driver hours-of-service logs.', { page: 1, author: 'Defense counsel' }) },
        { id: 'a-9', kind: 'email', summary: 'Co-counsel shared an expert shortlist', occurredAt: ago(40 * HOUR), source: source('email', 'Expert shortlist', ago(40 * HOUR), 'Three accident reconstruction experts with trucking experience, CVs attached.', { author: 'Co-counsel' }) },
      ],
      tasks: [
        { id: 't-5', title: 'Serve expert disclosures', dueAt: ahead(1 * DAY), done: false, waitingOn: null, source: source('task', 'Task: Serve expert disclosures', ago(7 * DAY), 'Task assigned in the source system: Serve expert disclosures.') },
        { id: 't-6', title: 'Draft deposition outline', dueAt: ahead(10 * DAY), done: false, waitingOn: null, source: source('task', 'Task: Draft deposition outline', ago(7 * DAY), 'Task assigned in the source system: Draft deposition outline.') },
      ],
    },
    {
      id: 'm-1011',
      clientName: 'Lena Okoye',
      caseType: 'Pedestrian struck',
      stage: 'Treatment',
      lastClientContactAt: ago(17 * DAY),
      estimatedValue: 210_000,
      coverageLimit: 25_000,
      activity: [
        { id: 'a-10', kind: 'provider_reply', summary: 'Mercy General sent itemized bills', occurredAt: ago(4 * DAY), source: source('bill', 'Itemized bills, Mercy General', ago(4 * DAY), 'Emergency department and inpatient charges, itemized by date of service.', { page: 3 }) },
      ],
      tasks: [
        { id: 't-7', title: 'Billing ledger from Mercy General', dueAt: ahead(6 * DAY), done: false, waitingOn: 'Mercy General', source: source('task', 'Task: Billing ledger from Mercy General', ago(7 * DAY), 'Task assigned in the source system: Billing ledger from Mercy General.') },
      ],
    },
    {
      id: 'm-1003',
      clientName: 'Carlos Mendes',
      caseType: 'Motorcycle collision',
      stage: 'Negotiation',
      lastClientContactAt: ago(5 * DAY),
      estimatedValue: 140_000,
      coverageLimit: 100_000,
      activity: [
        { id: 'a-11', kind: 'provider_reply', summary: 'Sunrise Chiropractic accepted a 30% lien reduction', occurredAt: ago(10 * HOUR), source: source('letter', 'Lien reduction acceptance', ago(10 * HOUR), 'Sunrise Chiropractic agrees to reduce its lien by 30% upon settlement.', { page: 1, author: 'Sunrise Chiropractic' }) },
      ],
      tasks: [
        { id: 't-8', title: 'Send settlement statement to client', dueAt: ago(1 * DAY), done: false, waitingOn: null, source: source('task', 'Task: Send settlement statement to client', ago(7 * DAY), 'Task assigned in the source system: Send settlement statement to client.') },
      ],
    },
    {
      id: 'm-0998',
      clientName: 'Hannah Liu',
      caseType: 'Premises liability, stairwell',
      stage: 'Demand',
      lastClientContactAt: ago(3 * HOUR),
      estimatedValue: 65_000,
      coverageLimit: 500_000,
      activity: [
        { id: 'a-12', kind: 'client_message', summary: 'Sent photos of the broken stair tread', occurredAt: ago(3 * HOUR), source: source('message', 'Client portal message', ago(3 * HOUR), 'Here are the photos of the stair where I fell. The tread is still broken.', { author: 'Hannah Liu' }) },
      ],
      tasks: [
        { id: 't-9', title: 'Finalize demand letter', dueAt: ahead(5 * DAY), done: false, waitingOn: null, source: source('task', 'Task: Finalize demand letter', ago(7 * DAY), 'Task assigned in the source system: Finalize demand letter.') },
      ],
    },
    {
      id: 'm-0987',
      clientName: 'Robert Hale',
      caseType: 'Rideshare collision',
      stage: 'Treatment',
      lastClientContactAt: ago(32 * DAY),
      estimatedValue: 55_000,
      coverageLimit: null,
      activity: [
        { id: 'a-13', kind: 'email', summary: 'Rideshare insurer opened a claim', occurredAt: ago(12 * DAY), source: source('email', 'Claim acknowledgment', ago(12 * DAY), 'A claim has been opened for the reported incident. Please direct correspondence to the adjuster.', { author: 'Rideshare insurer' }) },
      ],
      tasks: [
        { id: 't-10', title: 'UM/UIM policy declarations', dueAt: ago(4 * DAY), done: false, waitingOn: 'Rideshare insurer', source: source('task', 'Task: UM/UIM policy declarations', ago(7 * DAY), 'Task assigned in the source system: UM/UIM policy declarations.') },
      ],
    },
    {
      id: 'm-0975',
      clientName: 'Sofia Marino',
      caseType: 'Auto collision, T-bone',
      stage: 'Settled',
      lastClientContactAt: ago(11 * DAY),
      estimatedValue: 48_000,
      coverageLimit: 50_000,
      activity: [
        { id: 'a-14', kind: 'document', summary: 'Signed release returned', occurredAt: ago(9 * DAY), source: source('letter', 'Signed release', ago(9 * DAY), 'Release of all claims, signed and notarized.', { page: 4 }) },
      ],
      tasks: [
        { id: 't-11', title: 'Disburse settlement funds', dueAt: ago(6 * DAY), done: true, waitingOn: null, source: source('task', 'Task: Disburse settlement funds', ago(7 * DAY), 'Task assigned in the source system: Disburse settlement funds.') },
      ],
    },
    {
      id: 'm-0964',
      clientName: 'Andre Wallace',
      caseType: 'Workplace injury, third party',
      stage: 'Litigation',
      lastClientContactAt: ago(15 * DAY),
      estimatedValue: 310_000,
      coverageLimit: 1_000_000,
      activity: [
        { id: 'a-15', kind: 'email', summary: 'Opposing counsel asked to move mediation', occurredAt: ago(5 * HOUR), source: source('email', 'Mediation scheduling', ago(5 * HOUR), 'Our expert is unavailable that week. Can we move mediation to early November?', { author: 'Opposing counsel' }) },
        // Arrives ninety seconds after load, to show a matter that was
        // already opened flipping back to "new".
        { id: 'a-16', kind: 'provider_reply', summary: 'Valley PT returned the narrative report', occurredAt: ahead(90_000), source: source('medical_record', 'Narrative report, Valley PT', ahead(90_000), 'Patient has plateaued; residual deficits in lifting tolerance are likely permanent.', { page: 2, author: 'Valley Physical Therapy' }) },
      ],
      tasks: [
        { id: 't-12', title: 'Confirm mediation date', dueAt: ahead(2 * DAY), done: false, waitingOn: 'Opposing counsel', source: source('task', 'Task: Confirm mediation date', ago(7 * DAY), 'Task assigned in the source system: Confirm mediation date.') },
      ],
    },
  ],
};
