"use client";

import { useState, useMemo } from "react";

interface Expenses {
  councilRates: number;
  insurance: number;
  strata: number;
  maintenance: number;
  managementFee: number;
  waterRates: number;
  landTax: number;
  other: number;
}

const defaultExpenses: Expenses = {
  councilRates: 1500,
  insurance: 1200,
  strata: 0,
  maintenance: 1000,
  managementFee: 0,
  waterRates: 800,
  landTax: 0,
  other: 0,
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(n);

export default function RentalYieldCalc() {
  const [purchasePrice, setPurchasePrice] = useState(650000);
  const [weeklyRent, setWeeklyRent] = useState(550);
  const [vacancyWeeks, setVacancyWeeks] = useState(2);
  const [expenses, setExpenses] = useState<Expenses>(defaultExpenses);
  const [showExpenses, setShowExpenses] = useState(false);

  const results = useMemo(() => {
    const annualRent = weeklyRent * 52;
    const effectiveRent = weeklyRent * (52 - vacancyWeeks);
    const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
    const mgmtFeeCalc = expenses.managementFee > 0 ? expenses.managementFee : 0;
    const totalCosts = totalExpenses;
    const netIncome = effectiveRent - totalCosts;
    const grossYield = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
    const netYield = purchasePrice > 0 ? (netIncome / purchasePrice) * 100 : 0;

    return {
      annualRent,
      effectiveRent,
      totalExpenses: totalCosts,
      netIncome,
      grossYield,
      netYield,
      weeklyNet: netIncome / 52,
    };
  }, [purchasePrice, weeklyRent, vacancyWeeks, expenses]);

  const updateExpense = (key: keyof Expenses, value: number) => {
    setExpenses((prev) => ({ ...prev, [key]: value }));
  };

  const yieldColor = (y: number) =>
    y >= 6 ? "text-success" : y >= 4 ? "text-warning" : "text-error";

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🏠 AU Rental Yield Calculator</h1>
        <p className="text-base-content/70 text-lg">
          Calculate gross &amp; net rental yield for Australian investment properties
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Property Details</h2>

            <div className="form-control mb-4">
              <label className="label"><span className="label-text font-semibold">Purchase Price</span></label>
              <label className="input input-bordered flex items-center gap-2">
                $
                <input
                  type="number"
                  className="grow"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  min={0}
                  step={10000}
                />
              </label>
              <input
                type="range"
                min={100000}
                max={3000000}
                step={10000}
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="range range-primary range-sm mt-2"
              />
            </div>

            <div className="form-control mb-4">
              <label className="label"><span className="label-text font-semibold">Weekly Rent</span></label>
              <label className="input input-bordered flex items-center gap-2">
                $
                <input
                  type="number"
                  className="grow"
                  value={weeklyRent}
                  onChange={(e) => setWeeklyRent(Number(e.target.value))}
                  min={0}
                  step={10}
                />
              </label>
              <input
                type="range"
                min={100}
                max={2000}
                step={10}
                value={weeklyRent}
                onChange={(e) => setWeeklyRent(Number(e.target.value))}
                className="range range-secondary range-sm mt-2"
              />
            </div>

            <div className="form-control mb-4">
              <label className="label"><span className="label-text font-semibold">Vacancy (weeks/year)</span></label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={vacancyWeeks}
                onChange={(e) => setVacancyWeeks(Number(e.target.value))}
                min={0}
                max={52}
              />
            </div>

            {/* Expenses Toggle */}
            <div className="collapse collapse-arrow bg-base-200 mt-2">
              <input
                type="checkbox"
                checked={showExpenses}
                onChange={() => setShowExpenses(!showExpenses)}
              />
              <div className="collapse-title font-semibold">
                Annual Expenses ({formatCurrency(results.totalExpenses)})
              </div>
              <div className="collapse-content">
                {(Object.keys(expenses) as (keyof Expenses)[]).map((key) => (
                  <div key={key} className="form-control mb-2">
                    <label className="label py-1">
                      <span className="label-text text-sm capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </label>
                    <label className="input input-bordered input-sm flex items-center gap-2">
                      $
                      <input
                        type="number"
                        className="grow"
                        value={expenses[key]}
                        onChange={(e) => updateExpense(key, Number(e.target.value))}
                        min={0}
                        step={100}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Results</h2>

            {/* Yield Stats */}
            <div className="stats stats-vertical shadow w-full mb-4">
              <div className="stat">
                <div className="stat-title">Gross Rental Yield</div>
                <div className={`stat-value ${yieldColor(results.grossYield)}`}>
                  {results.grossYield.toFixed(2)}%
                </div>
                <div className="stat-desc">Annual rent ÷ purchase price</div>
              </div>
              <div className="stat">
                <div className="stat-title">Net Rental Yield</div>
                <div className={`stat-value ${yieldColor(results.netYield)}`}>
                  {results.netYield.toFixed(2)}%
                </div>
                <div className="stat-desc">After expenses &amp; vacancy</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td className="font-semibold">Annual Rent (gross)</td>
                    <td className="text-right">{formatCurrency(results.annualRent)}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Vacancy Loss ({vacancyWeeks}wk)</td>
                    <td className="text-right text-error">
                      -{formatCurrency(results.annualRent - results.effectiveRent)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Effective Rent</td>
                    <td className="text-right">{formatCurrency(results.effectiveRent)}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Total Expenses</td>
                    <td className="text-right text-error">
                      -{formatCurrency(results.totalExpenses)}
                    </td>
                  </tr>
                  <tr className="border-t-2">
                    <td className="font-bold">Net Annual Income</td>
                    <td className={`text-right font-bold ${results.netIncome >= 0 ? "text-success" : "text-error"}`}>
                      {formatCurrency(results.netIncome)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold">Net Weekly Income</td>
                    <td className="text-right">{formatCurrency(results.weeklyNet)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Yield Guide */}
            <div className="mt-4 p-4 bg-base-200 rounded-lg">
              <h3 className="font-semibold mb-2">📊 Yield Guide (AU)</h3>
              <div className="text-sm space-y-1">
                <p><span className="badge badge-success badge-sm">6%+</span> Excellent — strong cash flow</p>
                <p><span className="badge badge-warning badge-sm">4-6%</span> Average — typical metro area</p>
                <p><span className="badge badge-error badge-sm">&lt;4%</span> Low — relying on capital growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title">Understanding Rental Yield in Australia</h2>
          <div className="prose max-w-none">
            <p>
              <strong>Gross rental yield</strong> is the simplest measure — annual rent divided by property
              purchase price. It gives a quick comparison between properties but doesn&apos;t account for
              the real costs of ownership.
            </p>
            <p>
              <strong>Net rental yield</strong> factors in vacancy periods and ownership expenses like
              council rates, insurance, strata fees, maintenance, property management fees, water rates,
              and land tax. This gives a more accurate picture of your actual return.
            </p>
            <h3>Typical Australian Rental Yields (2024-2025)</h3>
            <ul>
              <li><strong>Sydney:</strong> 2.5% – 4% gross (houses), 4% – 5.5% (units)</li>
              <li><strong>Melbourne:</strong> 3% – 4.5% gross (houses), 4.5% – 6% (units)</li>
              <li><strong>Brisbane:</strong> 3.5% – 5% gross (houses), 5% – 6.5% (units)</li>
              <li><strong>Perth:</strong> 4% – 5.5% gross (houses), 5.5% – 7% (units)</li>
              <li><strong>Regional areas:</strong> 5% – 8%+ (higher yield, higher risk)</li>
            </ul>
            <p>
              Remember: a higher yield isn&apos;t always better. Regional areas may offer higher yields but
              lower capital growth and higher vacancy rates. Balance yield against growth potential,
              tenant demand, and your investment strategy.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-base-content/50 mt-8 pb-4 text-sm">
        <p>AU Rental Yield Calculator — Free tool for Australian property investors</p>
        <p className="mt-1">Calculations are estimates only. Consult a financial advisor for investment decisions.</p>
      </footer>
    </main>
  );
}
