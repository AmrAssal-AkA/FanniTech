import type { Metadata } from "next";
import { RepairRequestsClient } from "@/components/RepairRequests/RepairRequestsClient";

export const metadata: Metadata = {
  title: "Repair Requests Management | FanniTech Lab OS",
  description:
    "Intake triage and ticket conversion for customer mobile repair requests.",
};

export default function RequestsPage() {
  return <RepairRequestsClient />;
}