import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Property Tools",
  description: "Free Australian property calculators — compound interest, rental yield, mortgage repayment.",
};

const tools = [
  {
    href: "/tools/compound-interest",
    emoji: "📈",
    title: "Compound Interest Calculator",
    desc: "See how your savings grow with compound interest over time.",
  },
  {
    href: "/tools/rental-yield",
    emoji: "🏠",
    title: "Rental Yield Calculator",
    desc: "Calculate gross & net rental yield for investment properties.",
  },
  {
    href: "/tools/mortgage-repayment",
    emoji: "🏦",
    title: "Mortgage Repayment Calculator",
    desc: "Estimate monthly repayments, total interest, and amortisation.",
  },
];

export default function ToolsIndex() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-center mb-2">🛠️ Property Tools</h1>
      <p className="text-center text-base-content/70 mb-8">
        Free calculators for Australian property investors
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((t) => (
          <Link key={t.href} href={t.href} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body items-center text-center">
              <span className="text-5xl mb-2">{t.emoji}</span>
              <h2 className="card-title text-lg">{t.title}</h2>
              <p className="text-sm text-base-content/60">{t.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
