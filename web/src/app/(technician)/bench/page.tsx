import type { Metadata } from "next";
import { TechnicianBenchClient } from "@/components/TechnicianBench/TechnicianBenchClient";

export const metadata: Metadata = {
  title: "Bench Queue | FanniTech Lab OS",
  description: "Technician workbench active repair queue and hardware diagnostics.",
};

export default function TechnicianBenchPage() {
  return <TechnicianBenchClient />;
}

