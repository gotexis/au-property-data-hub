import type { Metadata } from "next";
import CompoundInterestCalc from "./CompoundInterestCalc";

export const metadata: Metadata = {
  title: "Compound Interest Calculator",
  description: "Free Australian compound interest calculator. See how your savings grow with regular deposits and compound interest over time.",
};

export default function Page() {
  return <CompoundInterestCalc />;
}
