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
    title: `${name} (${stateUpper}) Suburb Property Prices — ${getSuburbsByState(stateUpper).length} Suburbs`,
    description: `Compare suburb house prices and growth trends across ${name}. Official government property data for ${getSuburbsByState(stateUpper).length} suburbs.`,
  };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const stateUpper = state.toUpperCase();
  const stateName = STATE_NAMES[stateUpper];
  if (!stateName) notFound();

  const suburbs = getSuburbsByState(stateUpper).sort((a, b) => b.medianHousePrice - a.medianHousePrice);
  if (suburbs.length === 0) notFound();

  const avgPrice = Math.round(suburbs.reduce((sum, s) => sum + s.medianHousePrice, 0) / suburbs.length);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li>{stateUpper}</li>
        </ul>
      </div>

      <h1 className="text-4xl font-bold mb-2">{stateName} Property Data</h1>
      <p className="text-lg opacity-70 mb-8">{suburbs.length} suburbs · Avg median house price {formatPrice(avgPrice)}</p>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Suburb</th>
              <th>Postcode</th>
              <th>Median House</th>
              <th>Quarterly Growth</th>
              <th>Sales (Q)</th>
            </tr>
          </thead>
          <tbody>
            {suburbs.map(s => (
              <tr key={s.slug}>
                <td><Link href={`/suburb/${s.slug}`} className="link link-hover font-medium">{s.name}</Link></td>
                <td>{s.postcode || '—'}</td>
                <td>{formatPrice(s.medianHousePrice)}</td>
                <td className={((s as any).quarterlyGrowth ?? 0) >= 0 ? 'text-success' : 'text-error'}>
                  {(s as any).quarterlyGrowth != null ? `${(s as any).quarterlyGrowth > 0 ? '+' : ''}${(s as any).quarterlyGrowth}%` : '—'}
                </td>
                <td>{(s as any).numSales ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
