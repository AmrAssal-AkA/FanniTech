import axios from "axios";
import { postStaffLogin, postStaffLogout } from "@/app/api/auth";
import type { LoginCredentials, LoginResponse } from "@/types/auth";
import {appClient} from "@/lib/appClient";

export const authenticateStaff = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const email = (credentials.email || credentials.identifier || "").trim();
  const password = credentials.password || credentials.passphrase || "";

  if (!email) {
    throw new Error("Staff email or identifier is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address (e.g. admin@fannitech.com)");
  }

  if (!password) {
    throw new Error("Access password is required");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const deviceInfo =
    credentials.deviceInfo ||
    (typeof window !== "undefined"
      ? `${window.navigator.platform} - ${window.navigator.userAgent.substring(0, 80)}`
      : "FanniTech Web Client");

  try {
    return await postStaffLogin({
      ...credentials,
      email,
      password,
      deviceInfo,
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      const msg = error.response.data.message;
      throw new Error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred during authentication");
  }
};

export const logoutStaff = async (): Promise<void> => {
  try {
    await postStaffLogout();
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to log out");
  }
};
