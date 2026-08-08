// Initial realistic sample data for testing & demo mode
export const INITIAL_MOCK_SIGNS = [
  {
    id: 'sign_1723078718001_a9f1',
    eventId: 'katr-2026',
    address: '240 Springfield Ave, Summit, NJ 07901',
    latitude: 40.7162,
    longitude: -74.3567,
    s3Bucket: 'katr-org-static-website-production',
    s3Key: 'lawn-signs/2026/sign_1723078718001.jpg',
    s3Url: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&w=800&q=80',
    status: 'placed',
    placedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    placedBy: 'John D.',
    collectedAt: null,
    notes: 'Visible at corner of Springfield & Maple. Next to Knights sign.'
  },
  {
    id: 'sign_1723078718002_b8e2',
    eventId: 'katr-2026',
    address: '425 Broad St, Westfield, NJ 07090',
    latitude: 40.6521,
    longitude: -74.3478,
    s3Bucket: 'katr-org-static-website-production',
    s3Key: 'lawn-signs/2026/sign_1723078718002.jpg',
    s3Url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    status: 'placed',
    placedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    placedBy: 'Mike R.',
    collectedAt: null,
    notes: 'Placed right by driveway entrance with homeowner consent.'
  },
  {
    id: 'sign_1723078718003_c7d3',
    eventId: 'katr-2026',
    address: '10 North Ave E, Cranford, NJ 07016',
    latitude: 40.6588,
    longitude: -74.2985,
    s3Bucket: 'katr-org-static-website-production',
    s3Key: 'lawn-signs/2026/sign_1723078718003.jpg',
    s3Url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80',
    status: 'collected',
    placedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    placedBy: 'Sarah T.',
    collectedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: 'Collected after event. Stored in Council hall storage.'
  },
  {
    id: 'sign_1723078718004_d6c4',
    eventId: 'katr-2026',
    address: '150 Morris Ave, Springfield, NJ 07081',
    latitude: 40.7065,
    longitude: -74.3212,
    s3Bucket: 'katr-org-static-website-production',
    s3Key: 'lawn-signs/2026/sign_1723078718004.jpg',
    s3Url: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=800&q=80',
    status: 'missing',
    placedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    placedBy: 'Bob K.',
    collectedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    notes: 'Checked site on collection run, sign was missing. Likely removed by lawn crew.'
  }
];
