import type { Metadata } from "next";
import { TechniciansClient } from "@/components/Technicians/TechniciansClient";

export const metadata: Metadata = {
  title: "Technicians Management | FanniTech Lab OS",
  description:
    "Real-time oversight of hardware specialists, active component diagnostics, bench occupancy status, and throughput calibration across Lab #01.",
};

export default function TechniciansPage() {
  return <TechniciansClient />;
}