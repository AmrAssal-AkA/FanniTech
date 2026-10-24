import useSWR from "swr";

import { CustomerService } from "@/services/customer.service";
import type {
  CustomerListResponseData,
  GetCustomersParams,
} from "@/types/customers";

export function useCustomers(params: GetCustomersParams = { page: 1, limit: 10, search: "" }) {
  const { page = 1, limit = 10, search = "" } = params;
  const cacheKey = `/api/admin/customer/getCustomers?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<CustomerListResponseData>(
    cacheKey,
    () => CustomerService.getAllCustomers({ page, limit, search }),
    {
      revalidateOnFocus: true,
      refreshInterval: 15000,
      keepPreviousData: true,
      shouldRetryOnError: (err) => {
        const msg = String(err?.message || "").toLowerCase();
        if (msg.includes("unauthorized") || msg.includes("session expired")) {
          return false;
        }
        return true;
      },
    }
  );

  return {
    data,
    items: data?.items ?? [],
    pagination: data?.pagination ?? {
      page,
      limit,
      total: 0,
      totalPages: 1,
    },
    isLoading,
    isValidating,
    isError: error,
    mutate,
  };
}
