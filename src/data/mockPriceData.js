// Mock price base data to simulate fetching from an API
export const BASE_PEPTIDE_PRICES = {
  'Semaglutide': 240,
  'Tirzepatide': 280,
  'Retatrutide': 310,
  'Liraglutide': 180,
  'Dulaglutide': 170,
  'CJC-1295 (DAC)': 130,
  'CJC-1295 (no DAC)': 95,
  'Ipamorelin': 85,
  'MK-677 (Ibutamoren)': 70,
  'BPC-157': 65,
  'TB-500': 120,
  'Thymosin Alpha-1': 110,
  'GHK-Cu': 60,
  'Melanotan II': 75,
  'PT-141 (Bremelanotide)': 90,
  'Follistatin 344': 260,
  'YK-11': 140,
  'AOD-9604': 55,
  'MOTS-c': 95,
  'Semax': 45,
  'Selank': 45,
  'Cerebrolysin': 150,
  'P21': 120,
  'SS-31 (Elamipretide)': 220,
  'Epithalon': 80
};

export const VENDORS = [
  { id: 'vendor1', name: 'PeptideSciences', url: 'https://www.peptidesciences.com', modifier: 0.98 },
  { id: 'vendor2', name: 'AmericanResearchLabs', url: 'https://americanresearchlabs.com', modifier: 1.02 },
  { id: 'vendor3', name: 'BioTechPeptides', url: 'https://biotechpeptides.com', modifier: 0.95 },
  { id: 'vendor4', name: 'PureRawz', url: 'https://purerawz.co', modifier: 1.05 },
  { id: 'vendor5', name: 'SwissChems', url: 'https://swisschems.is', modifier: 1.0 }
];

export const SHIPPING_OPTIONS = ['Free', 'Free', '$7.99', '$9.99', '$12.99'];
