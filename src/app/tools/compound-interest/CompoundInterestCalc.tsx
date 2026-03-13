"use client";

import { useState, useMemo } from "react";

type Frequency = "daily" | "monthly" | "quarterly" | "annually";

function compoundInterest(
  principal: number,
  rate: number,
  years: number,
  frequency: Frequency,
  monthlyDeposit: number
) {
  const n = frequency === "daily" ? 365 : frequency === "monthly" ? 12 : frequency === "quarterly" ? 4 : 1;
  const r = rate / 100;
  const yearlyData: { year: number; balance: number; totalDeposits: number; totalInterest: number }[] = [];
  let balance = principal;
  let totalDeposits = principal;

  for (let year = 1; year <= years; year++) {
    for (let period = 0; period < n; period++) {
      balance *= 1 + r / n;
      const depositsPerPeriod = (monthlyDeposit * 12) / n;
      balance += depositsPerPeriod;
      totalDeposits += depositsPerPeriod;
    }
    yearlyData.push({
      year,
      balance: Math.round(balance * 100) / 100,
      totalDeposits: Math.round(totalDeposits * 100) / 100,
      totalInterest: Math.round((balance - totalDeposits) * 100) / 100,
    });
  }
  return yearlyData;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export default function CompoundInterestCalc() {
  const [principal, setPrincipal] = useState(10000);
  const [rate, setRate] = useState(5.5);
  const [years, setYears] = useState(20);
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [monthlyDeposit, setMonthlyDeposit] = useState(500);

  const data = useMemo(() => compoundInterest(principal, rate, years, frequency, monthlyDeposit), [principal, rate, years, frequency, monthlyDeposit]);
  const final = data[data.length - 1];

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">📈 Compound Interest Calculator</h1>
        <p className="text-base-content/70 text-lg">See how your savings grow with compound interest</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Settings</h2>
            <div className="form-control">
              <label className="label"><span className="label-text">Initial Investment</span></label>
              <label className="input input-bordered flex items-center gap-2">$<input type="number" className="grow" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} min={0} /></label>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Annual Interest Rate: {rate}%</span></label>
              <input type="range" min="0.5" max="15" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="range range-primary range-sm" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Investment Period: {years} years</span></label>
              <input type="range" min="1" max="50" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="range range-secondary range-sm" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Monthly Deposit</span></label>
              <label className="input input-bordered flex items-center gap-2">$<input type="number" className="grow" value={monthlyDeposit} onChange={(e) => setMonthlyDeposit(Number(e.target.value))} min={0} /></label>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Compounding Frequency</span></label>
              <select className="select select-bordered w-full" value={frequency} onChange={(e) => setFrequency(e.target.value as Frequency)}>
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="stat bg-base-100 rounded-box shadow">
              <div className="stat-title">Final Balance</div>
              <div className="stat-value text-primary text-2xl">{fmt(final?.balance ?? 0)}</div>
            </div>
            <div className="stat bg-base-100 rounded-box shadow">
              <div className="stat-title">Total Deposits</div>
              <div className="stat-value text-blue-500 text-2xl">{fmt(final?.totalDeposits ?? 0)}</div>
            </div>
            <div className="stat bg-base-100 rounded-box shadow">
              <div className="stat-title">Interest Earned</div>
              <div className="stat-value text-emerald-500 text-2xl">{fmt(final?.totalInterest ?? 0)}</div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Year-by-Year Breakdown</h2>
              <div className="overflow-x-auto max-h-96">
                <table className="table table-sm table-pin-rows">
                  <thead><tr><th>Year</th><th className="text-right">Balance</th><th className="text-right">Deposits</th><th className="text-right">Interest</th></tr></thead>
                  <tbody>
                    {data.map((d) => (
                      <tr key={d.year}>
                        <td>{d.year}</td>
                        <td className="text-right font-semibold">{fmt(d.balance)}</td>
                        <td className="text-right">{fmt(d.totalDeposits)}</td>
                        <td className="text-right text-success">{fmt(d.totalInterest)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body prose max-w-none">
          <h2>What is Compound Interest?</h2>
          <p>Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods. In Australia, most savings accounts and term deposits use compound interest, making it a powerful tool for growing your wealth.</p>
          <h3>Tips for Australian Investors</h3>
          <ul>
            <li>High-interest savings accounts currently offer 4.5%–5.5% p.a.</li>
            <li>Regular deposits significantly boost returns through compounding</li>
            <li>Interest income is taxable at your marginal tax rate</li>
            <li>Compare compounding frequencies when choosing savings products</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
