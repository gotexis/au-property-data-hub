'use client';

import { useState } from 'react';
import Link from 'next/link';
import suburbsData from '@/data/suburbs.json';

interface Suburb {
  slug: string; name: string; state: string; postcode: string;
  medianHousePrice: number; medianUnitPrice: number; medianRentHouse: number; medianRentUnit: number;
  houseGrowth1yr: number; houseGrowth5yr: number; rentalYield: number;
  population: number; medianAge: number; medianIncome: number;
  ownerOccupied: number; renting: number; familyHouseholds: number; singleHouseholds: number;
}

const suburbs = suburbsData as Suburb[];

function fmt(n: number) {
  return n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : `$${(n/1000).toFixed(0)}K`;
}

export default function ComparePage() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const subA = suburbs.find(s => s.slug === a);
  const subB = suburbs.find(s => s.slug === b);

  const rows: { label: string; key: keyof Suburb; format?: (v: number) => string; suffix?: string }[] = [
    { label: 'Median House Price', key: 'medianHousePrice', format: fmt },
    { label: 'Median Unit Price', key: 'medianUnitPrice', format: fmt },
    { label: 'House Rent/wk', key: 'medianRentHouse', format: (v) => `$${v}` },
    { label: 'Unit Rent/wk', key: 'medianRentUnit', format: (v) => `$${v}` },
    { label: '1yr Growth', key: 'houseGrowth1yr', suffix: '%' },
    { label: '5yr Growth', key: 'houseGrowth5yr', suffix: '%' },
    { label: 'Rental Yield', key: 'rentalYield', suffix: '%' },
    { label: 'Population', key: 'population', format: (v) => v.toLocaleString() },
    { label: 'Median Age', key: 'medianAge' },
    { label: 'Median Income', key: 'medianIncome', format: fmt },
    { label: 'Owner Occupied', key: 'ownerOccupied', suffix: '%' },
    { label: 'Renting', key: 'renting', suffix: '%' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Compare Suburbs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <select className="select select-bordered w-full" value={a} onChange={e => setA(e.target.value)}>
          <option value="">Select suburb A</option>
          {suburbs.map(s => <option key={s.slug} value={s.slug}>{s.name}, {s.state} {s.postcode}</option>)}
        </select>
        <select className="select select-bordered w-full" value={b} onChange={e => setB(e.target.value)}>
          <option value="">Select suburb B</option>
          {suburbs.map(s => <option key={s.slug} value={s.slug}>{s.name}, {s.state} {s.postcode}</option>)}
        </select>
      </div>

      {subA && subB && (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Metric</th>
                <th><Link href={`/suburb/${subA.slug}`} className="link">{subA.name}, {subA.state}</Link></th>
                <th><Link href={`/suburb/${subB.slug}`} className="link">{subB.name}, {subB.state}</Link></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const va = subA[r.key] as number;
                const vb = subB[r.key] as number;
                const fmtV = (v: number) => r.format ? r.format(v) : `${v}${r.suffix || ''}`;
                return (
                  <tr key={r.key}>
                    <td>{r.label}</td>
                    <td className={va > vb ? 'font-bold text-success' : ''}>{fmtV(va)}</td>
                    <td className={vb > va ? 'font-bold text-success' : ''}>{fmtV(vb)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(!subA || !subB) && (
        <div className="text-center py-12 opacity-50">
          <p className="text-xl">Select two suburbs above to compare their property data side by side.</p>
        </div>
      )}
    </div>
  );
}
