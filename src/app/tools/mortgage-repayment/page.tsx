import type { Metadata } from "next";
import MortgageCalc from "./MortgageCalc";

export const metadata: Metadata = {
  title: "Mortgage Repayment Calculator",
  description: "Free Australian mortgage repayment calculator. Estimate monthly repayments, total interest, and loan amortisation.",
};

export default function Page() {
  return <MortgageCalc />;
}
