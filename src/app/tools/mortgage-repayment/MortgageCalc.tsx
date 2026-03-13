"use client";

import { useState, useMemo } from "react";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export default function MortgageCalc() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [rate, setRate] = useState(6.0);
  const [years, setYears] = useState(30);
  const [repaymentType, setRepaymentType] = useState<"pi" | "io">("pi");

  const results = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const totalMonths = years * 12;

    if (repaymentType === "io") {
      const monthlyPayment = loanAmount * monthlyRate;
      return {
        monthlyPayment,
        totalPayment: monthlyPayment * totalMonths + loanAmount,
        totalInterest: monthlyPayment * totalMonths,
        principalRemaining: loanAmount,
      };
    }

    if (monthlyRate === 0) {
      return { monthlyPayment: loanAmount / totalMonths, totalPayment: loanAmount, totalInterest: 0, principalRemaining: 0 };
    }

    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const totalPayment = monthlyPayment * totalMonths;
    return { monthlyPayment, totalPayment, totalInterest: totalPayment - loanAmount, principalRemaining: 0 };
  }, [loanAmount, rate, years, repaymentType]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">🏦 Mortgage Repayment Calculator</h1>
        <p className="text-base-content/70 text-lg">Estimate your Australian home loan repayments</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Loan Details</h2>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Loan Amount</span></label>
              <label className="input input-bordered flex items-center gap-2">$<input type="number" className="grow" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} min={0} step={10000} /></label>
              <input type="range" min={50000} max={2000000} step={10000} value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="range range-primary range-sm mt-2" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Interest Rate: {rate}%</span></label>
              <input type="range" min="1" max="12" step="0.05" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="range range-secondary range-sm" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Loan Term: {years} years</span></label>
              <input type="range" min="1" max="40" step="1" value={years} onChange={(e) => setYears(Number(e.target.value))} className="range range-accent range-sm" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-semibold">Repayment Type</span></label>
              <select className="select select-bordered w-full" value={repaymentType} onChange={(e) => setRepaymentType(e.target.value as "pi" | "io")}>
                <option value="pi">Principal & Interest</option>
                <option value="io">Interest Only</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Results</h2>
            <div className="stats stats-vertical shadow w-full">
              <div className="stat">
                <div className="stat-title">Monthly Repayment</div>
                <div className="stat-value text-primary text-2xl">{fmt(results.monthlyPayment)}</div>
                <div className="stat-desc">{fmt(results.monthlyPayment * 12)}/year</div>
              </div>
              <div className="stat">
                <div className="stat-title">Total Interest</div>
                <div className="stat-value text-error text-2xl">{fmt(results.totalInterest)}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Total Repayment</div>
                <div className="stat-value text-2xl">{fmt(results.totalPayment)}</div>
              </div>
            </div>
            {repaymentType === "io" && (
              <div className="alert alert-warning mt-4">
                <span>⚠️ Interest-only: you still owe {fmt(loanAmount)} at the end of the term.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body prose max-w-none">
          <h2>Understanding Mortgage Repayments in Australia</h2>
          <p><strong>Principal & Interest (P&I)</strong> loans pay down both the loan balance and interest each month. By the end of the term, the loan is fully repaid.</p>
          <p><strong>Interest Only (IO)</strong> loans only pay interest for a set period. The principal remains unchanged, resulting in lower repayments but no equity buildup.</p>
          <h3>Current Australian Rates (2025)</h3>
          <ul>
            <li>Big 4 banks: 5.8%–6.5% variable (owner-occupier P&I)</li>
            <li>Online lenders: 5.5%–6.2% variable</li>
            <li>Fixed rates (1-3yr): 5.5%–6.5%</li>
            <li>Investor rates typically 0.3%–0.5% higher</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
