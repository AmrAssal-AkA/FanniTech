import { postStaffLogin } from "@/app/api/auth";
import type { LoginCredentials, LoginResponse } from "@/types/auth";

export const authenticateStaff = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {

  const sanitizedIdentifier = credentials.identifier.trim();
  if (!sanitizedIdentifier) {
    throw new Error("Staff Email or Tech ID is required");
  }
  if (!credentials.passphrase) {
    throw new Error("Access passphrase is required");
  }

  return postStaffLogin({
    ...credentials,
    identifier: sanitizedIdentifier,
  });
};
