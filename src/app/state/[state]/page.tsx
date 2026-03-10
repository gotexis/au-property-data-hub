import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllStates, getSuburbsByState, formatPrice, STATE_NAMES } from '@/lib/suburbs';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return getAllStates().map(s => ({ state: s.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const stateUpper = state.toUpperCase();
  const name = STATE_NAMES[stateUpper];
  if (!name) return {};
  return {
    title: `${name} (${stateUpper}) Suburb Property Prices`,
    description: `Compare suburb house prices, rental yields, and growth across ${name}. Find the best suburbs to buy or invest in ${stateUpper}.`,
  };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const stateUpper = state.toUpperCase();
  const stateName = STATE_NAMES[stateUpper];
  if (!stateName) notFound();

  const suburbs = getSuburbsByState(stateUpper).sort((a, b) => b.medianHousePrice - a.medianHousePrice);

  const avgPrice = Math.round(suburbs.reduce((sum, s) => sum + s.medianHousePrice, 0) / suburbs.length);
  const avgYield = (suburbs.reduce((sum, s) => sum + s.rentalYield, 0) / suburbs.length).toFixed(1);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li>{stateUpper}</li>
        </ul>
      </div>

      <h1 className="text-4xl font-bold mb-2">{stateName} Property Data</h1>
      <p className="text-lg opacity-70 mb-8">{suburbs.length} suburbs · Avg median house price {formatPrice(avgPrice)} · Avg yield {avgYield}%</p>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Suburb</th>
              <th>Postcode</th>
              <th>Median House</th>
              <th>Median Unit</th>
              <th>House Rent/wk</th>
              <th>1yr Growth</th>
              <th>Yield</th>
              <th>Population</th>
            </tr>
          </thead>
          <tbody>
            {suburbs.map(s => (
              <tr key={s.slug}>
                <td><Link href={`/suburb/${s.slug}`} className="link link-hover font-medium">{s.name}</Link></td>
                <td>{s.postcode}</td>
                <td>{formatPrice(s.medianHousePrice)}</td>
                <td>{formatPrice(s.medianUnitPrice)}</td>
                <td>${s.medianRentHouse}</td>
                <td className="text-success">+{s.houseGrowth1yr}%</td>
                <td>{s.rentalYield}%</td>
                <td>{s.population.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
