"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { createTechnicianAccount } from "@/services/technicians.service";
import type { BackendCreatedTechnician } from "@/types/technicians";

export interface AddTechnicianFormData {
  name: string;
  arabicName: string;
  email: string;
  phone?: string;
  role: string;
  bay: string;
  shift: string;
  specialization: string;
  createdTechnician?: BackendCreatedTechnician;
}

interface AddTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AddTechnicianFormData) => void;
}

const PHONE_REGEX = /^\+?\d{8,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateSecurePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
  let pwd = "";
  for (let i = 0; i < 12; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export function AddTechnicianModal({
  isOpen,
  onClose,
  onSubmit,
}: AddTechnicianModalProps) {
  const [name, setName] = useState("");
  const [arabicName, setArabicName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Specialist");
  const [bay, setBay] = useState("Bay #08 (Open Station)");
  const [shift, setShift] = useState("Alpha (08:00 - 17:00 AST)");
  const [specialization, setSpecialization] = useState("SMD / Micro-Soldering");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setName("");
    setArabicName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setPhone("");
    setRole("Specialist");
    setBay("Bay #08 (Open Station)");
    setShift("Alpha (08:00 - 17:00 AST)");
    setSpecialization("SMD / Micro-Soldering");
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleGeneratePassword = () => {
    const newPwd = generateSecurePassword();
    setPassword(newPwd);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setErrorMessage("Full Name is required.");
      return;
    }

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid staff email address.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
      setErrorMessage(
        "Invalid phone number format. Must contain 8 to 15 digits (e.g. +20 120 000 000).",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const createdData = await createTechnicianAccount({
        name: trimmedName,
        email: trimmedEmail,
        password,
        phone: trimmedPhone || undefined,
        role: "TECHNICIAN",
      });

      onSubmit({
        name: trimmedName,
        arabicName: arabicName.trim() || trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone || undefined,
        role,
        bay,
        shift,
        specialization,
        createdTechnician: createdData,
      });

      resetForm();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to create technician account.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-technician-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/80 border border-sky-100 dark:border-sky-900 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="add-technician-title"
                className="text-base font-bold text-zinc-900 dark:text-zinc-50"
              >
                Add / Onboard Technician
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Register a new bench specialist and create their portal
                credentials
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="tech-name"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="tech-name"
                type="text"
                required
                disabled={isSubmitting}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Khalid Al-Shehri"
                className="w-full h-9 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="tech-email"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Staff Email <span className="text-red-500">*</span>
              </label>
              <input
                id="tech-email"
                type="email"
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="khalid@fannitech.sa"
                className="w-full h-9 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500 disabled:opacity-60"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="tech-phone"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Phone Number{" "}
                <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <input
                id="tech-phone"
                type="tel"
                disabled={isSubmitting}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 120 000 000"
                className="w-full h-9 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password with generator & toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="tech-password"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Account Password <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                disabled={isSubmitting}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 font-medium cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Password</span>
              </button>
            </div>
            <div className="relative">
              <input
                id="tech-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-9 pl-3 pr-10 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-sky-500 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Credentials will be provided to the technician to sign into the
              staff workbench.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Technician Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
