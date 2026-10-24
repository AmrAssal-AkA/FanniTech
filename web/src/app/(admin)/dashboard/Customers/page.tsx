import type { Metadata } from "next";
import { CustomersClient } from "@/components/Customers/CustomersClient";

export const metadata: Metadata = {
  title: "Customers Management | FanniTech Lab OS",
  description:
    "Manage client profiles, cross-reference serial-bound hardware inventories, and audit repair tickets across Eastern Lab #01.",
};

export default function CustomersPage() {
  return <CustomersClient />;
}