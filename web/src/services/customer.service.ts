import axios from "axios";
import { appClient } from "@/lib/appClient";
import type {
  GetCustomersParams,
  GetCustomersApiResponse,
  CustomerListResponseData,
} from "@/types/customers";

export const CustomerService = {
  async getAllCustomers(
    params?: GetCustomersParams
  ): Promise<CustomerListResponseData> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.search && params.search.trim()) {
        queryParams.search = params.search.trim();
      }

      const response = await appClient.get<GetCustomersApiResponse>(
        "/api/admin/customer/getCustomers",
        { params: queryParams }
      );

      if (!response.data || !response.data.success || !response.data.data) {
        throw new Error(response.data?.message || "Failed to fetch customers.");
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          (typeof error.response?.data?.message === "string" &&
            error.response.data.message) ||
          error.message ||
          "Failed to fetch customers.";
        throw new Error(msg);
      }
      if (error instanceof Error) {
        throw new Error(`Failed to fetch customers: ${error.message}`);
      }
      throw new Error("An unexpected error occurred while fetching customers.");
    }
  },
};

export const fetchAllCustomers = (params?: GetCustomersParams) =>
  CustomerService.getAllCustomers(params);