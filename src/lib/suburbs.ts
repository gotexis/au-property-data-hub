import suburbsData from '@/data/suburbs.json';

export interface Suburb {
  slug: string;
  name: string;
  state: string;
  postcode: string;
  medianHousePrice: number;
  medianUnitPrice: number | null;
  medianRentHouse: number | null;
  medianRentUnit: number | null;
  houseGrowth1yr: number | null;
  houseGrowth5yr: number | null;
  rentalYield: number | null;
  population: number | null;
  medianAge: number | null;
  medianIncome: number | null;
  ownerOccupied: number | null;
  renting: number | null;
  familyHouseholds: number | null;
  singleHouseholds: number | null;
  lat: number | null;
  lng: number | null;
  description: string;
  numSales?: number | null;
  dataSource?: string;
  dataPeriod?: string;
  quarterlyGrowth?: number | null;
}

export function getAllSuburbs(): Suburb[] {
  return suburbsData as Suburb[];
}

export function getSuburbBySlug(slug: string): Suburb | undefined {
  return getAllSuburbs().find(s => s.slug === slug);
}

export function getSuburbsByState(state: string): Suburb[] {
  return getAllSuburbs().filter(s => s.state === state);
}

export function getAllStates(): string[] {
  return [...new Set(getAllSuburbs().map(s => s.state))];
}

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  return `$${(price / 1000).toFixed(0)}K`;
}

export function formatFullPrice(price: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(price);
}

export const STATE_NAMES: Record<string, string> = {
  NSW: 'New South Wales',
  VIC: 'Victoria',
  QLD: 'Queensland',
  WA: 'Western Australia',
  SA: 'South Australia',
  TAS: 'Tasmania',
  ACT: 'Australian Capital Territory',
  NT: 'Northern Territory',
};
