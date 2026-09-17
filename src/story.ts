/**
 * The story. Scroll is a descent: from the altitude where a company is a row,
 * to the floor where the work is, to the sheet of paper that becomes a system,
 * then back out to see the whole column at once.
 */
export type Vec3 = [number, number, number];

export interface Chapter {
  id: string;
  /** signage on the slab and in the elevator panel */
  plaque: string;
  nav: string;
  /** scroll length in vh; the pinned text is centred for (length - 100)vh of it */
  length: number;
  statement: string;
  body: string;
  cam: { pos: Vec3; look: Vec3 };
}

/** the slabs of the column, top to bottom */
export const FLOORS = [
  { id: 'fund', y: 24, plaque: '−1   THE FUND' },
  { id: 'deal', y: 12, plaque: '−2   THE DEAL' },
  { id: 'company', y: 0, plaque: '−3   THE COMPANY' },
  { id: 'plant', y: -12, plaque: '−4   THE FLOOR' },
] as const;

export const SLAB = { w: 26, h: 18, hw: 13, hh: 9, t: 0.36 };
export const SHEET_Y = -26;

export const CHAPTERS: Chapter[] = [
  {
    id: 'surface', plaque: '00   Surface', nav: 'Surface', length: 130,
    statement: 'Go where the work is.',
    body: 'AiStudio builds AI for private equity the only way we know it works: with engineers inside the fund, inside the deal, and inside the companies themselves.',
    cam: { pos: [8.5, 43, 18], look: [0, 21.5, -1.5] },
  },
  {
    id: 'fund', plaque: '−1   The fund', nav: 'The fund', length: 150,
    statement: 'From up here, a company is a row.',
    body: 'Revenue, margin, headcount, a hold period. A partner sees forty of these. The row is true, and it explains almost nothing about where the time goes.',
    cam: { pos: [3.5, 31.5, 4.5], look: [-5, 24.3, -7] },
  },
  {
    id: 'deal', plaque: '−2   The deal', nav: 'The deal', length: 150,
    statement: 'The data room is what a company chooses to show.',
    body: 'Decks, contracts, audited accounts. We add one thing: read-only access to the systems the company actually runs on, and a working demo on its own data before the committee meets. Diligence you can click.',
    cam: { pos: [-6.5, 21, 9.5], look: [-1, 12.4, -4.5] },
  },
  {
    id: 'company', plaque: '−3   The company', nav: 'The company', length: 150,
    statement: 'Down here, the business runs on paper.',
    body: 'Email threads twenty people long. Spreadsheets with six versions. A system from another decade that everyone has learned to work around. Nobody drew this. It grew. And it is where the value is.',
    cam: { pos: [6, 9.5, -6.5], look: [-4.5, 0.6, 5] },
  },
  {
    id: 'floor', plaque: '−4   The floor', nav: 'The floor', length: 150,
    statement: 'This is where we sit.',
    body: 'Our engineers work from the client’s own desk: the back office, the plant, the fund’s Monday meeting. We read the systems, sit with the people who do the work, and build with them. One workflow at a time, in production, on their data, in weeks.',
    cam: { pos: [-5.5, -3, -5.5], look: [5, -11.4, 5.5] },
  },
  {
    id: 'sheet', plaque: '−5   The sheet', nav: 'The sheet', length: 190,
    statement: 'One document at a time, the paper becomes a system.',
    body: 'A delivery note becomes a record. A quote request becomes a priced reply. A thread becomes a case with an owner. A person approves every result until the numbers match. Then we stay until it runs without us.',
    cam: { pos: [4, -25, 30], look: [4, -26, 0] },
  },
  {
    id: 'method', plaque: '—   How we build', nav: 'How we build', length: 150,
    statement: 'Ninety percent software. Ten percent AI.',
    body: 'The model is the easy part. The hard part is the hand-off, the exception, the writeback, and the person who has to trust it. Four rules keep us honest.',
    cam: { pos: [7, -21.5, 36], look: [4.5, -26, 0] },
  },
  {
    id: 'altitudes', plaque: '↑   Every altitude', nav: 'Every altitude', length: 160,
    statement: 'One team, every altitude.',
    body: 'What we learn on the floor changes how we read a data room. What we build for one company becomes a pattern for the next. The fund sees the same measures across its portfolio, and the deal team sees what a company is really made of before it buys.',
    cam: { pos: [40, 15, 35], look: [0, 6, 0] },
  },
  {
    id: 'who', plaque: '—   Who we are', nav: 'Who we are', length: 170,
    statement: 'We learned this where mistakes cost money.',
    body: 'AiStudio was founded by engineers from quantitative trading, where software is judged by what it does when the market opens. We are registered in DIFC, Dubai, with an engineering team across Dubai and India, and we deploy on site across Europe.',
    cam: { pos: [-33, 9, 35], look: [0, 6, 0] },
  },
  {
    id: 'start', plaque: '—   Start', nav: 'Start', length: 140,
    statement: 'Bring us one company.',
    body: 'Thirty minutes with a partner. Tell us where the time goes. We will tell you honestly whether we can help and what the first eight weeks would look like.',
    cam: { pos: [0, 50, 48], look: [0, 8, 0] },
  },
];

export const TENETS = [
  ['The human stays in the first version.', 'The system proposes and shows its evidence. A person approves. Liability sits with the client, and the design respects that.'],
  ['Cost per record is a design constraint.', 'If a model call costs more than the person it helps, it is the wrong architecture. Classical methods do the bulk. Models do the residual.'],
  ['Ground truth before pipelines.', 'We rebuild the truth from source documents by hand before we trust a system with a corpus. Where it is not certain, it says so.'],
  ['Your data stays in your jurisdiction.', 'EU environments for EU companies. Encrypted deliverables, deletion policies, and access we can account for.'],
];

export const FOUNDERS = [
  { initials: 'SM', name: 'Sharad Mirani', role: 'Managing Partner, AI and Engineering', bio: 'Quantitative trading at Tower Research, Optiver and Goldman Sachs. Leads engineering and the systems we put into production.', linkedin: 'https://linkedin.com/in/sharad157', email: 'sharad@aistudio.ae' },
  { initials: 'MP', name: 'Monish Pathare', role: 'Managing Partner, Business and Operations', bio: 'Built data-science and automation frameworks from scratch across a venture portfolio. Runs client relationships and delivery.', linkedin: 'https://linkedin.com/in/monish-pathare', email: 'monish@aistudio.ae' },
];

export const ADVISORS = [
  ['Sagar Savla', 'Product and AI advisor, Google DeepMind'],
  ['Ankush Thakkar', 'Go-to-market advisor, L.E.K. Consulting'],
  ['Ravi Lakhani', 'Capital and networks, ABRA Ventures'],
];

export const CALENDLY = 'https://calendly.com/sharad-aistudio/30min';

export const TOTAL_VH = CHAPTERS.reduce((a, c) => a + c.length, 0);

/** scroll fraction (0..1 of the scrollable range) at which each chapter's pinned text is centred */
export function stationFractions(): number[] {
  const range = TOTAL_VH - 100;
  let acc = 0;
  return CHAPTERS.map((c) => { const f = (acc + (c.length - 100) / 2) / range; acc += c.length; return f; });
}

/** [start, end] scroll fractions of each chapter's section */
export function chapterRanges(): [number, number][] {
  const range = TOTAL_VH - 100;
  let acc = 0;
  return CHAPTERS.map((c) => { const r: [number, number] = [acc / range, (acc + c.length - 100) / range]; acc += c.length; return r; });
}
