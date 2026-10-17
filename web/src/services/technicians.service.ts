import axios from "axios";
import { appClient } from "@/lib/appClient";
import type {
  CreateTechnicianAccountPayload,
  CreateTechnicianApiResponse,
  BackendCreatedTechnician,
  BackendTechnicianItem,
  GetListTechniciansApiResponse,
  DetailedTechnicianData,
  DetailedTechnicianApiResponse,
  UpdateTechnicianPayload,
  UpdateTechnicianApiResponse,
  ResetTechnicianPasswordPayload,
  ResetTechnicianPasswordApiResponse,
  DeleteTechnicianApiResponse,
  TransferTechnicianTicketsPayload,
  TransferTechnicianTicketsApiResponse,
} from "@/types/technicians";
import type { TechnicianOption } from "@/types/requests";

export const TechniciansService = {
  /**
   * Create a new technician account via the admin API
   */
  async createTechnician(
    payload: CreateTechnicianAccountPayload
  ): Promise<BackendCreatedTechnician> {
    try {
      const response = await appClient.post<CreateTechnicianApiResponse>(
        "/api/admin/technicians/AddTechnician",
        payload
      );

      if (!response.data || !response.data.success || !response.data.data) {
        throw new Error(
          response.data?.message || "Failed to create technician account."
        );
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          (typeof error.response?.data?.message === "string" &&
            error.response.data.message) ||
          (Array.isArray(error.response?.data?.message) &&
            error.response.data.message.join(", ")) ||
          error.message ||
          "Failed to create technician account.";
        throw new Error(msg);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "An unexpected error occurred while creating the technician account."
      );
    }
  },

  /**
   * Fetch all technicians list via /api/admin/technicians/getListTechnician
   */
  async getListTechnicians(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<BackendTechnicianItem[]> {
    try {
      const response = await appClient.get<GetListTechniciansApiResponse>(
        "/api/admin/technicians/getListTechnician",
        { params }
      );

      if (!response.data || !response.data.success) {
        throw new Error(
          response.data?.message || "Failed to fetch technicians list."
        );
      }

      return Array.isArray(response.data.technicians)
        ? response.data.technicians
        : Array.isArray(response.data.data)
        ? response.data.data
        : [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          (typeof error.response?.data?.message === "string" &&
            error.response.data.message) ||
          error.message ||
          "Failed to fetch technicians list.";
        throw new Error(msg);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "An unexpected error occurred while fetching technicians list."
      );
    }
  },

  /**
   * Fetch a single technician's complete profile, stats, and active tickets
   */
  async getTechnicianById(id: string): Promise<DetailedTechnicianData> {
    try {
      const response = await appClient.get<DetailedTechnicianApiResponse>(
        `/api/admin/technicians/${id}`
      );

      const data = response.data?.data || response.data?.technician;
      if (!response.data || !response.data.success || !data) {
        throw new Error(
          response.data?.message || `Failed to fetch technician with ID ${id}.`
        );
      }

      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          (typeof error.response?.data?.message === "string" &&
            error.response.data.message) ||
          error.message ||
          `Failed to fetch technician with ID ${id}.`;
        throw new Error(msg);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        `An unexpected error occurred while fetching technician with ID ${id}.`
      );
    }
  },

  /**
   * Update a technician's profile details (name, email, phone)
   */
  async updateTechnician(
    id: string,
    payload: UpdateTechnicianPayload
  ): Promise<UpdateTechnicianApiResponse["data"]> {
    try {
      const response = await appClient.patch<UpdateTechnicianApiResponse>(
        `/api/admin/technicians/${id}`,
        payload
      );

      if (!response.data || !response.data.success) {
        throw new Error(
          response.data?.message || `Failed to update technician with ID ${id}.`
        );
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          (typeof error.response?.data?.message === "string" &&
            error.response.data.message) ||
          (Array.isArray(error.response?.data?.message) &&
            error.response.data.message.join(", ")) ||
          error.message ||
          `Failed to update technician with ID ${id}.`;
        throw new Error(msg);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        `An unexpected error occurred while updating technician with ID ${id}.`
      );
    }
  },

  /**
   * Reset a technician's password
   */
  async resetTechnicianPassword(
    id: string,
    payload: ResetTechnicianPasswordPayload
  ): Promise<string> {
    try {
      const response = await appClient.patch<ResetTechnicianPasswordApiResponse>(
        `/api/admin/technicians/${id}/reset-password`,
        payload
      );

      if (!response.data || !response.data.success) {
        throw new Error(
          response.data?.message || "Failed to reset technician password."
        );
      }

      return response.data.message;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          (typeof error.response?.data?.message === "string" &&
            error.response.data.message) ||
          error.message ||
          "Failed to reset technician password.";
        throw new Error(msg);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "An unexpected error occurred while resetting technician password."
      );
    }
  },

  /**
   * Delete a technician account
   */
  async deleteTechnician(id: string): Promise<string> {
    try {
      const response = await appClient.delete<DeleteTechnicianApiResponse>(
        `/api/admin/technicians/${id}`
      );

      if (!response.data || !response.data.success) {
        throw new Error(
          response.data?.message || `Failed to delete technician with ID ${id}.`
        );
      }

      return response.data.message;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          (typeof error.response?.data?.message === "string" &&
            error.response.data.message) ||
          error.message ||
          `Failed to delete technician with ID ${id}.`;
        throw new Error(msg);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        `An unexpected error occurred while deleting technician with ID ${id}.`
      );
    }
  },

  /**
   * Transfer all active tickets from one technician to another
   */
  async transferTechnicianTickets(
    id: string,
    payload: TransferTechnicianTicketsPayload
  ): Promise<{ message: string; transferredCount: number }> {
    try {
      const response = await appClient.post<TransferTechnicianTicketsApiResponse>(
        `/api/admin/technicians/${id}/transfer-tickets`,
        payload
      );

      if (!response.data || !response.data.success) {
        throw new Error(
          response.data?.message || "Failed to transfer technician tickets."
        );
      }

      return {
        message: response.data.message,
        transferredCount: response.data.transferredCount ?? 0,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const msg =
          (typeof error.response?.data?.message === "string" &&
            error.response.data.message) ||
          error.message ||
          "Failed to transfer technician tickets.";
        throw new Error(msg);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "An unexpected error occurred while transferring technician tickets."
      );
    }
  },

  /**
   * Fetch all technicians options
   */
  async getAllTechnicians(): Promise<TechnicianOption[]> {
    const response = await appClient.get<{
      success: boolean;
      technicians: TechnicianOption[];
    }>("/api/admin/technicians");
    return response.data.technicians || [];
  },
};

export const createTechnicianAccount = (
  payload: CreateTechnicianAccountPayload
) => TechniciansService.createTechnician(payload);

export const fetchListTechnicians = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => TechniciansService.getListTechnicians(params);

export const fetchTechnicianById = (id: string) =>
  TechniciansService.getTechnicianById(id);

export const updateTechnician = (
  id: string,
  payload: UpdateTechnicianPayload
) => TechniciansService.updateTechnician(id, payload);

export const resetTechnicianPassword = (
  id: string,
  payload: ResetTechnicianPasswordPayload
) => TechniciansService.resetTechnicianPassword(id, payload);

export const deleteTechnician = (id: string) =>
  TechniciansService.deleteTechnician(id);

export const transferTechnicianTickets = (
  id: string,
  payload: TransferTechnicianTicketsPayload
) => TechniciansService.transferTechnicianTickets(id, payload);

export const fetchAllTechnicians = () => TechniciansService.getAllTechnicians();
