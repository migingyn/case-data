// Fabricated sample matters. No real clients, providers or cases.
// Times are relative to when the app loaded so the dashboard always has
// something "new" to show. Swap getMatterDashboard to Supabase when the
// matters tables land.

const LOADED_AT = Date.now();
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

const ago = (ms: number) => new Date(LOADED_AT - ms).toISOString();
const ahead = (ms: number) => new Date(LOADED_AT + ms).toISOString();

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
        { id: 'a-1', kind: 'client_message', summary: 'Asked whether physical therapy past March is covered', occurredAt: ago(6 * HOUR) },
        { id: 'a-2', kind: 'provider_reply', summary: 'Dr. Okafor sent an updated treatment plan', occurredAt: ago(1 * DAY) },
        { id: 'a-3', kind: 'note', summary: 'Intake call notes filed', occurredAt: ago(5 * DAY) },
      ],
      tasks: [
        { id: 't-1', title: 'Request imaging records from Coastal Imaging', dueAt: ahead(3 * DAY), done: false, waitingOn: null },
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
        { id: 'a-4', kind: 'offer', summary: 'Insurer countered the demand at $42,000', occurredAt: ago(20 * HOUR) },
        { id: 'a-5', kind: 'email', summary: 'Adjuster confirmed receipt of the demand packet', occurredAt: ago(4 * DAY) },
      ],
      tasks: [
        { id: 't-2', title: 'Respond to counteroffer', dueAt: ahead(2 * DAY), done: false, waitingOn: null },
        { id: 't-3', title: 'Lien reduction from Harbor Orthopedics', dueAt: ahead(4 * DAY), done: false, waitingOn: 'Harbor Orthopedics' },
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
        { id: 'a-6', kind: 'note', summary: 'Homeowner policy identified', occurredAt: ago(8 * DAY) },
      ],
      tasks: [
        { id: 't-4', title: 'Collect signed medical authorization', dueAt: ago(2 * DAY), done: false, waitingOn: null },
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
        { id: 'a-7', kind: 'court_date', summary: 'Deposition of the defendant driver set for Oct 21', occurredAt: ago(1 * DAY) },
        { id: 'a-8', kind: 'document', summary: 'Defense produced 340 pages of driver logbooks', occurredAt: ago(30 * HOUR) },
        { id: 'a-9', kind: 'email', summary: 'Co-counsel shared an expert shortlist', occurredAt: ago(40 * HOUR) },
      ],
      tasks: [
        { id: 't-5', title: 'Serve expert disclosures', dueAt: ahead(1 * DAY), done: false, waitingOn: null },
        { id: 't-6', title: 'Draft deposition outline', dueAt: ahead(10 * DAY), done: false, waitingOn: null },
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
        { id: 'a-10', kind: 'provider_reply', summary: 'Mercy General sent itemized bills', occurredAt: ago(4 * DAY) },
      ],
      tasks: [
        { id: 't-7', title: 'Billing ledger from Mercy General', dueAt: ahead(6 * DAY), done: false, waitingOn: 'Mercy General' },
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
        { id: 'a-11', kind: 'provider_reply', summary: 'Sunrise Chiropractic accepted a 30% lien reduction', occurredAt: ago(10 * HOUR) },
      ],
      tasks: [
        { id: 't-8', title: 'Send settlement statement to client', dueAt: ago(1 * DAY), done: false, waitingOn: null },
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
        { id: 'a-12', kind: 'client_message', summary: 'Sent photos of the broken stair tread', occurredAt: ago(3 * HOUR) },
      ],
      tasks: [
        { id: 't-9', title: 'Finalize demand letter', dueAt: ahead(5 * DAY), done: false, waitingOn: null },
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
        { id: 'a-13', kind: 'email', summary: 'Rideshare insurer opened a claim', occurredAt: ago(12 * DAY) },
      ],
      tasks: [
        { id: 't-10', title: 'UM/UIM policy declarations', dueAt: ago(4 * DAY), done: false, waitingOn: 'Rideshare insurer' },
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
        { id: 'a-14', kind: 'document', summary: 'Signed release returned', occurredAt: ago(9 * DAY) },
      ],
      tasks: [
        { id: 't-11', title: 'Disburse settlement funds', dueAt: ago(6 * DAY), done: true, waitingOn: null },
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
        { id: 'a-15', kind: 'email', summary: 'Opposing counsel asked to move mediation', occurredAt: ago(5 * HOUR) },
        // Arrives ninety seconds after load, to show a matter that was
        // already opened flipping back to "new".
        { id: 'a-16', kind: 'provider_reply', summary: 'Valley PT returned the narrative report', occurredAt: ahead(90_000) },
      ],
      tasks: [
        { id: 't-12', title: 'Confirm mediation date', dueAt: ahead(2 * DAY), done: false, waitingOn: 'Opposing counsel' },
      ],
    },
  ],
};
