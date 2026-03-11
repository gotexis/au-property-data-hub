import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllSuburbs, getSuburbBySlug, formatFullPrice, formatPrice, STATE_NAMES } from '@/lib/suburbs';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return getAllSuburbs().map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const suburb = getSuburbBySlug(slug);
  if (!suburb) return {};
  const desc = suburb.rentalYield != null
    ? `${suburb.name} property data: median house price ${formatFullPrice(suburb.medianHousePrice)}, rental yield ${suburb.rentalYield}%, ${suburb.houseGrowth1yr ?? 'N/A'}% annual growth.`
    : `${suburb.name} property data: median house price ${formatFullPrice(suburb.medianHousePrice)}. Victorian Government data.`;
  return {
    title: `${suburb.name} ${suburb.state} ${suburb.postcode || ''} — Median House Price ${formatPrice(suburb.medianHousePrice)}`,
    description: desc,
  };
}

function StatCard({ title, value, desc }: { title: string; value: string | null; desc?: string | null }) {
  if (!value) return null;
  return (
    <div className="stat bg-base-200 rounded-box p-4">
      <div className="stat-title">{title}</div>
      <div className="stat-value text-2xl">{value}</div>
      {desc && <div className="stat-desc text-success">{desc}</div>}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (value == null || value === 'null' || value === 'N/A') return null;
  return <tr><td>{label}</td><td className="font-bold">{value}</td></tr>;
}

export default async function SuburbPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const suburb = getSuburbBySlug(slug);
  if (!suburb) notFound();

  const s = suburb;
  const weeklyMortgage = Math.round((s.medianHousePrice * 0.06 / 52) + (s.medianHousePrice * 0.8 / 30 / 52));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href={`/state/${s.state.toLowerCase()}`}>{s.state}</Link></li>
          <li>{s.name}</li>
        </ul>
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">{s.name}</h1>
          <p className="text-lg opacity-70">{STATE_NAMES[s.state]}{s.postcode ? ` · ${s.postcode}` : ''}</p>
        </div>
        <div className="md:ml-auto">
          <Link href={`/compare?a=${s.slug}`} className="btn btn-outline btn-sm">Compare this suburb</Link>
        </div>
      </div>

      <p className="text-lg mb-8">{s.description}</p>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Median House" value={formatPrice(s.medianHousePrice)} desc={s.houseGrowth1yr != null ? `${s.houseGrowth1yr > 0 ? '+' : ''}${s.houseGrowth1yr}% (est. annual)` : undefined} />
        {s.medianUnitPrice && <StatCard title="Median Unit" value={formatPrice(s.medianUnitPrice)} />}
        {s.rentalYield != null && <StatCard title="Rental Yield" value={`${s.rentalYield}%`} />}
        {s.population != null && <StatCard title="Population" value={`${(s.population / 1000).toFixed(1)}K`} />}
        {s.numSales != null && <StatCard title="Sales (Quarter)" value={String(s.numSales)} />}
      </div>

      {/* Detailed sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Property Prices */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">🏠 Property Prices</h2>
            <table className="table">
              <tbody>
                <DataRow label="Median House Price" value={formatFullPrice(s.medianHousePrice)} />
                <DataRow label="Median Unit Price" value={s.medianUnitPrice ? formatFullPrice(s.medianUnitPrice) : null} />
                <DataRow label="Quarterly Growth" value={s.quarterlyGrowth != null ? `${s.quarterlyGrowth > 0 ? '+' : ''}${s.quarterlyGrowth}%` : null} />
                <DataRow label="Est. Annual Growth" value={s.houseGrowth1yr != null ? `${s.houseGrowth1yr > 0 ? '+' : ''}${s.houseGrowth1yr}%` : null} />
                <DataRow label="5-Year Growth" value={s.houseGrowth5yr != null ? `+${s.houseGrowth5yr}%` : null} />
                <DataRow label="Est. Weekly Mortgage (80% LVR)" value={`$${weeklyMortgage}/wk`} />
                <DataRow label="Quarter Sales" value={s.numSales != null ? String(s.numSales) : null} />
              </tbody>
            </table>
          </div>
        </div>

        {/* Rental Market - only show if we have rental data */}
        {(s.medianRentHouse || s.medianRentUnit || s.rentalYield) && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">💰 Rental Market</h2>
              <table className="table">
                <tbody>
                  <DataRow label="Median House Rent" value={s.medianRentHouse ? `$${s.medianRentHouse}/wk` : null} />
                  <DataRow label="Median Unit Rent" value={s.medianRentUnit ? `$${s.medianRentUnit}/wk` : null} />
                  <DataRow label="Gross Rental Yield" value={s.rentalYield != null ? `${s.rentalYield}%` : null} />
                  <DataRow label="Annual Rent (House)" value={s.medianRentHouse ? formatFullPrice(s.medianRentHouse * 52) : null} />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Demographics - only show if we have data */}
        {(s.population || s.medianAge || s.medianIncome) && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">👥 Demographics</h2>
              <table className="table">
                <tbody>
                  <DataRow label="Population" value={s.population ? s.population.toLocaleString() : null} />
                  <DataRow label="Median Age" value={s.medianAge ? String(s.medianAge) : null} />
                  <DataRow label="Median Income" value={s.medianIncome ? `${formatFullPrice(s.medianIncome)}/yr` : null} />
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Housing breakdown - only show if we have data */}
        {(s.ownerOccupied || s.renting) && (
          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">🏘️ Housing Breakdown</h2>
              <table className="table">
                <tbody>
                  <DataRow label="Owner Occupied" value={s.ownerOccupied != null ? `${s.ownerOccupied}%` : null} />
                  <DataRow label="Renting" value={s.renting != null ? `${s.renting}%` : null} />
                  <DataRow label="Family Households" value={s.familyHouseholds != null ? `${s.familyHouseholds}%` : null} />
                  <DataRow label="Single Households" value={s.singleHouseholds != null ? `${s.singleHouseholds}%` : null} />
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Data source attribution */}
      {s.dataSource && (
        <div className="alert alert-info mt-8">
          <span>📊 Data source: {s.dataSource} ({s.dataPeriod}). This is official government data.</span>
        </div>
      )}

      {/* SEO content */}
      <section className="mt-12 prose max-w-none">
        <h2>About {s.name}, {s.state}{s.postcode ? ` ${s.postcode}` : ''}</h2>
        <p>
          {s.name} is a suburb in {STATE_NAMES[s.state]}{s.postcode ? ` with a postcode of ${s.postcode}` : ''}.
          The median house price is {formatFullPrice(s.medianHousePrice)}, based on official Victorian Government property sales data.
          {s.numSales != null && ` There were ${s.numSales} house sales recorded in the latest quarter.`}
        </p>
        {s.houseGrowth1yr != null && (
          <p>
            House prices have {s.houseGrowth1yr >= 0 ? 'grown' : 'declined'} by an estimated {Math.abs(s.houseGrowth1yr)}% over the past year.
            The estimated weekly mortgage repayment at 80% LVR is ${weeklyMortgage}.
          </p>
        )}
      </section>
    </div>
  );
}
