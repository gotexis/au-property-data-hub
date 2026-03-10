import Link from 'next/link';
import { getAllSuburbs, getAllStates, formatPrice, STATE_NAMES } from '@/lib/suburbs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AU Property Data Hub — Suburb House Prices, Trends & Demographics',
  description: 'Explore median house prices, rental yields, growth trends, and demographics for Australian suburbs. Compare suburbs across all states and territories.',
  keywords: 'Australian property prices, suburb house prices, median house price, rental yield Australia, property data, suburb demographics',
};

export default function Home() {
  const suburbs = getAllSuburbs();
  const states = getAllStates();

  const topGrowth = [...suburbs].sort((a, b) => b.houseGrowth1yr - a.houseGrowth1yr).slice(0, 6);
  const topYield = [...suburbs].sort((a, b) => b.rentalYield - a.rentalYield).slice(0, 6);
  const mostExpensive = [...suburbs].sort((a, b) => b.medianHousePrice - a.medianHousePrice).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <div className="hero bg-gradient-to-br from-primary to-secondary text-primary-content py-16">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold">AU Property Data Hub</h1>
            <p className="py-6 text-lg opacity-90">
              Suburb-level house prices, rental yields, growth trends, and demographics across Australia.
              Data-driven insights for buyers, investors, and renters.
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
              <Link
                key={state}
                href={`/state/${state.toLowerCase()}`}
                className="card bg-base-200 hover:bg-base-300 transition-colors"
              >
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
                    <span>1yr Growth</span>
                    <span className="font-bold">+{s.houseGrowth1yr}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Yields */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">💰 Best Rental Yields</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topYield.map(s => (
              <Link key={s.slug} href={`/suburb/${s.slug}`} className="card bg-base-200 hover:shadow-lg transition-shadow">
                <div className="card-body p-4">
                  <h3 className="card-title">{s.name}, {s.state}</h3>
                  <div className="flex justify-between">
                    <span>Median House</span>
                    <span className="font-bold">{formatPrice(s.medianHousePrice)}</span>
                  </div>
                  <div className="flex justify-between text-info">
                    <span>Rental Yield</span>
                    <span className="font-bold">{s.rentalYield}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

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
                  <div className="flex justify-between">
                    <span>Median Unit</span>
                    <span className="font-bold">{formatPrice(s.medianUnitPrice)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All Suburbs Table */}
        <section>
          <h2 className="text-3xl font-bold mb-6">All Suburbs</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Suburb</th>
                  <th>State</th>
                  <th>Median House</th>
                  <th>1yr Growth</th>
                  <th>Rental Yield</th>
                  <th>Population</th>
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
                    <td className="text-success">+{s.houseGrowth1yr}%</td>
                    <td>{s.rentalYield}%</td>
                    <td>{s.population.toLocaleString()}</td>
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
