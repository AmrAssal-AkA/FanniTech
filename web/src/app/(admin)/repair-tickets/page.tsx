import type { Metadata } from "next";
import { TicketsClient } from "@/components/RepairTickets/TicketsClient";

export const metadata: Metadata = {
  title: "Repair Tickets Management | FanniTech Lab OS",
  description:
    "End-to-end diagnosis, lab repairs, and hardware pickup management.",
};

export default function RepairTicketsPage() {
  return <TicketsClient />;
}

