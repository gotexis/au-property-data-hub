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
  return {
    title: `${suburb.name} ${suburb.state} ${suburb.postcode} — Median House Price ${formatPrice(suburb.medianHousePrice)}`,
    description: `${suburb.name} property data: median house price ${formatFullPrice(suburb.medianHousePrice)}, rental yield ${suburb.rentalYield}%, ${suburb.houseGrowth1yr}% annual growth. Demographics, rent prices, and trends.`,
  };
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
          <p className="text-lg opacity-70">{STATE_NAMES[s.state]} · {s.postcode}</p>
        </div>
        <div className="md:ml-auto">
          <Link href={`/compare?a=${s.slug}`} className="btn btn-outline btn-sm">Compare this suburb</Link>
        </div>
      </div>

      <p className="text-lg mb-8">{s.description}</p>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-200 rounded-box p-4">
          <div className="stat-title">Median House</div>
          <div className="stat-value text-2xl">{formatPrice(s.medianHousePrice)}</div>
          <div className="stat-desc text-success">+{s.houseGrowth1yr}% (1yr)</div>
        </div>
        <div className="stat bg-base-200 rounded-box p-4">
          <div className="stat-title">Median Unit</div>
          <div className="stat-value text-2xl">{formatPrice(s.medianUnitPrice)}</div>
        </div>
        <div className="stat bg-base-200 rounded-box p-4">
          <div className="stat-title">Rental Yield</div>
          <div className="stat-value text-2xl">{s.rentalYield}%</div>
        </div>
        <div className="stat bg-base-200 rounded-box p-4">
          <div className="stat-title">Population</div>
          <div className="stat-value text-2xl">{(s.population / 1000).toFixed(1)}K</div>
        </div>
      </div>

      {/* Detailed sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Property Prices */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">🏠 Property Prices</h2>
            <table className="table">
              <tbody>
                <tr><td>Median House Price</td><td className="font-bold">{formatFullPrice(s.medianHousePrice)}</td></tr>
                <tr><td>Median Unit Price</td><td className="font-bold">{formatFullPrice(s.medianUnitPrice)}</td></tr>
                <tr><td>1-Year House Growth</td><td className="text-success font-bold">+{s.houseGrowth1yr}%</td></tr>
                <tr><td>5-Year House Growth</td><td className="text-success font-bold">+{s.houseGrowth5yr}%</td></tr>
                <tr><td>Est. Weekly Mortgage (80% LVR)</td><td className="font-bold">${weeklyMortgage}/wk</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Rental Market */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">💰 Rental Market</h2>
            <table className="table">
              <tbody>
                <tr><td>Median House Rent</td><td className="font-bold">${s.medianRentHouse}/wk</td></tr>
                <tr><td>Median Unit Rent</td><td className="font-bold">${s.medianRentUnit}/wk</td></tr>
                <tr><td>Gross Rental Yield</td><td className="font-bold">{s.rentalYield}%</td></tr>
                <tr><td>Annual Rent (House)</td><td className="font-bold">{formatFullPrice(s.medianRentHouse * 52)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Demographics */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">👥 Demographics</h2>
            <table className="table">
              <tbody>
                <tr><td>Population</td><td className="font-bold">{s.population.toLocaleString()}</td></tr>
                <tr><td>Median Age</td><td className="font-bold">{s.medianAge}</td></tr>
                <tr><td>Median Income</td><td className="font-bold">{formatFullPrice(s.medianIncome)}/yr</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Housing */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">🏘️ Housing Breakdown</h2>
            <table className="table">
              <tbody>
                <tr><td>Owner Occupied</td><td className="font-bold">{s.ownerOccupied}%</td></tr>
                <tr><td>Renting</td><td className="font-bold">{s.renting}%</td></tr>
                <tr><td>Family Households</td><td className="font-bold">{s.familyHouseholds}%</td></tr>
                <tr><td>Single Households</td><td className="font-bold">{s.singleHouseholds}%</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SEO content */}
      <section className="mt-12 prose max-w-none">
        <h2>About {s.name}, {s.state} {s.postcode}</h2>
        <p>
          {s.name} is located in {STATE_NAMES[s.state]} with a postcode of {s.postcode}.
          The current median house price is {formatFullPrice(s.medianHousePrice)}, having grown
          {s.houseGrowth1yr}% over the past year and {s.houseGrowth5yr}% over five years.
          Units have a median price of {formatFullPrice(s.medianUnitPrice)}.
        </p>
        <p>
          For investors, the gross rental yield in {s.name} is {s.rentalYield}%, with median
          weekly rents of ${s.medianRentHouse} for houses and ${s.medianRentUnit} for units.
          The suburb has a population of {s.population.toLocaleString()} with a median age of {s.medianAge}
          and median household income of {formatFullPrice(s.medianIncome)} per year.
        </p>
        <p>
          {s.ownerOccupied}% of dwellings are owner-occupied while {s.renting}% are rented.
          {s.familyHouseholds}% of households are families and {s.singleHouseholds}% are single-person households.
        </p>
      </section>
    </div>
  );
}
