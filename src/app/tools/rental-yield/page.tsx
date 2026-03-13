import type { Metadata } from "next";
import RentalYieldCalc from "./RentalYieldCalc";

export const metadata: Metadata = {
  title: "Rental Yield Calculator",
  description: "Free Australian rental yield calculator. Calculate gross and net rental yield for investment properties.",
};

export default function Page() {
  return <RentalYieldCalc />;
}
