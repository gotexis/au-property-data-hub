import Link from 'next/link';
import { getAllSuburbs, getAllStates, formatPrice, STATE_NAMES } from '@/lib/suburbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AU Property Data Hub — Suburb House Prices, Trends & Demographics',
  description: 'Explore median house prices, rental yields, growth trends, and demographics for 747+ Australian suburbs. Official Victorian Government data.',
  keywords: 'Australian property prices, suburb house prices, median house price, rental yield Australia, property data, suburb demographics',
};

export default function Home() {
  const suburbs = getAllSuburbs();
  const states = getAllStates();

  const withGrowth = suburbs.filter(s => s.houseGrowth1yr != null);
  const topGrowth = [...withGrowth].sort((a, b) => (b.houseGrowth1yr ?? 0) - (a.houseGrowth1yr ?? 0)).slice(0, 6);
  const mostExpensive = [...suburbs].sort((a, b) => b.medianHousePrice - a.medianHousePrice).slice(0, 6);
  const mostAffordable = [...suburbs].sort((a, b) => a.medianHousePrice - b.medianHousePrice).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <div className="hero bg-gradient-to-br from-primary to-secondary text-primary-content py-16">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold">AU Property Data Hub</h1>
            <p className="py-6 text-lg opacity-90">
              Suburb-level house prices and growth trends across {suburbs.length} Australian suburbs.
              Powered by official Victorian Government property sales data.
            </p>
            <Link href="/compare" className="btn btn-accent btn-lg">
              Compare Suburbs →
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Browse by State */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Browse by State</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {states.map(state => (
              <Link key={state} href={`/state/${state.toLowerCase()}`} className="card bg-base-200 hover:bg-base-300 transition-colors">
                <div className="card-body p-4">
                  <h3 className="card-title text-lg">{state}</h3>
                  <p className="text-sm opacity-70">{STATE_NAMES[state]}</p>
                  <p className="text-sm">{suburbs.filter(s => s.state === state).length} suburbs</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Growth */}
        {topGrowth.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">🚀 Fastest Growing Suburbs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topGrowth.map(s => (
                <Link key={s.slug} href={`/suburb/${s.slug}`} className="card bg-base-200 hover:shadow-lg transition-shadow">
                  <div className="card-body p-4">
                    <h3 className="card-title">{s.name}, {s.state}</h3>
                    <div className="flex justify-between">
                      <span>Median House</span>
                      <span className="font-bold">{formatPrice(s.medianHousePrice)}</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span>Est. Annual Growth</span>
                      <span className="font-bold">{(s.houseGrowth1yr ?? 0) > 0 ? '+' : ''}{s.houseGrowth1yr}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Most Expensive */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">🏠 Most Expensive Suburbs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mostExpensive.map(s => (
              <Link key={s.slug} href={`/suburb/${s.slug}`} className="card bg-base-200 hover:shadow-lg transition-shadow">
                <div className="card-body p-4">
                  <h3 className="card-title">{s.name}, {s.state}</h3>
                  <div className="flex justify-between">
                    <span>Median House</span>
                    <span className="font-bold text-warning">{formatPrice(s.medianHousePrice)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Most Affordable */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">💰 Most Affordable Suburbs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mostAffordable.map(s => (
              <Link key={s.slug} href={`/suburb/${s.slug}`} className="card bg-base-200 hover:shadow-lg transition-shadow">
                <div className="card-body p-4">
                  <h3 className="card-title">{s.name}, {s.state}</h3>
                  <div className="flex justify-between">
                    <span>Median House</span>
                    <span className="font-bold text-success">{formatPrice(s.medianHousePrice)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All Suburbs Table */}
        <section>
          <h2 className="text-3xl font-bold mb-6">All {suburbs.length} Suburbs</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Suburb</th>
                  <th>State</th>
                  <th>Median House</th>
                  <th>Quarterly Growth</th>
                  <th>Sales</th>
                </tr>
              </thead>
              <tbody>
                {[...suburbs].sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                  <tr key={s.slug}>
                    <td>
                      <Link href={`/suburb/${s.slug}`} className="link link-hover font-medium">
                        {s.name}
                      </Link>
                    </td>
                    <td>{s.state}</td>
                    <td>{formatPrice(s.medianHousePrice)}</td>
                    <td className={((s as any).quarterlyGrowth ?? 0) >= 0 ? 'text-success' : 'text-error'}>
                      {(s as any).quarterlyGrowth != null ? `${(s as any).quarterlyGrowth > 0 ? '+' : ''}${(s as any).quarterlyGrowth}%` : 'N/A'}
                    </td>
                    <td>{(s as any).numSales ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
