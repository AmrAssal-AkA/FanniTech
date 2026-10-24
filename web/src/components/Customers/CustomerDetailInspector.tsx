"use client";

import { useState } from "react";
import {
  PhoneCall,
  MessageSquare,
  Mail,
  Edit3,
  MoreVertical,
  StickyNote,
  Laptop,
  PlusCircle,
  Archive,
  PlusSquare,
  Tablet,
} from "lucide-react";
import type { Customer } from "@/types/customers";

interface CustomerDetailInspectorProps {
  customer: Customer | null;
  onOpenCreateTicket: (customer: Customer) => void;
  onArchiveCustomer: (customer: Customer) => void;
  onRegisterDevice: (customer: Customer) => void;
  onDirectCall: (phone: string) => void;
  onWhatsApp: (phone: string) => void;
  onSendEmail: (email: string) => void;
}

export function CustomerDetailInspector({
  customer,
  onOpenCreateTicket,
  onArchiveCustomer,
  onRegisterDevice,
  onDirectCall,
  onWhatsApp,
  onSendEmail,
}: CustomerDetailInspectorProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteContent, setNoteContent] = useState(customer?.notes || "");

  if (!customer) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-xs p-8 flex flex-col items-center justify-center text-center">
        <Laptop className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-3" />
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">
          No Customer Selected
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Select any customer from the directory table to inspect their linked devices, active tickets, and repair history.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-xs p-5 flex flex-col gap-4">
      {/* Header Strip */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0 font-mono">
            {(customer.name || "CL")
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase()}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                {customer.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-mono text-sky-600 dark:text-sky-400 font-semibold">
                #{customer.id}
              </span>
              <span>•</span>
              <span>Member since {customer.memberSince}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
            title="Edit Customer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center transition-colors"
            title="Customer Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Communication & Dispatch Action Row */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onDirectCall(customer.phone)}
          className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/60 transition-colors text-center group cursor-pointer"
        >
          <PhoneCall className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
            Direct Call
          </span>
        </button>
        <button
          type="button"
          onClick={() => onWhatsApp(customer.phone)}
          className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/60 transition-colors text-center group cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
            WhatsApp
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSendEmail(customer.email)}
          className="flex flex-col items-center justify-center p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/60 transition-colors text-center group cursor-pointer"
        >
          <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
            Send Email
          </span>
        </button>
      </div>

      {/* Contact & Location Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50/80 dark:bg-zinc-800/40 p-3 rounded-lg border border-zinc-200/70 dark:border-zinc-800/70 text-xs">
        <div>
          <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">
            Official Phone
          </span>
          <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
            {customer.phone}
          </p>
        </div>
        <div>
          <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block">
            Primary Email
          </span>
          <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 truncate">
            {customer.email}
          </p>
        </div>
      </div>

      {/* Operational Internal Lab Notes */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200/70 dark:border-zinc-800/70">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wide flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5" />
            Admin &amp; Technician Bench Notes
          </span>
          <button
            type="button"
            onClick={() => setIsEditingNotes(!isEditingNotes)}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium"
          >
            {isEditingNotes ? "Done" : "Edit"}
          </button>
        </div>
        {isEditingNotes ? (
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="w-full text-xs p-2 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            rows={3}
          />
        ) : (
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {noteContent || customer.notes}
          </p>
        )}
      </div>

      {/* SECTION: Associated Hardware Assets */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
              Registered Devices
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono font-semibold">
              {customer.devicesCount ?? customer.devices.length} Units
            </span>
          </div>
          <button
            type="button"
            onClick={() => onRegisterDevice(customer)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Register Device</span>
          </button>
        </div>

        {/* Hardware Device Stack */}
        <div className="flex flex-col gap-2">
          {customer.devices.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <Laptop className="w-5 h-5 mx-auto mb-1 text-zinc-400" />
              <span>{customer.devicesCount} devices on system record</span>
            </div>
          ) : (
            customer.devices.map((device) => {
              const isTablet =
                device.model.toLowerCase().includes("ipad") ||
                device.type.toLowerCase().includes("tablet");
              const isInLab = device.status === "In Lab";

              return (
                <div
                  key={device.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    isInLab
                      ? "bg-sky-50/50 dark:bg-sky-950/20 border-sky-200/80 dark:border-sky-900/60"
                      : "bg-white dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-700/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shrink-0">
                        {isTablet ? (
                          <Tablet className="w-4 h-4" />
                        ) : (
                          <Laptop className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                          {device.model}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          SN: {device.serialNumber}{" "}
                          {device.specs ? `· ${device.specs}` : ""}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap border ${
                        isInLab
                          ? "bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-900"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      {device.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 mt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                    {device.activeTicket ? (
                      <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                        Active Ticket:{" "}
                        <strong className="text-sky-600 dark:text-sky-400 font-mono font-semibold">
                          {device.activeTicket}
                        </strong>
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[11px]">
                        {device.lastServiced || "No active tickets"}
                      </span>
                    )}

                    {device.bay ? (
                      <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {device.bay}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenCreateTicket(customer)}
                        className="text-sky-600 dark:text-sky-400 text-[11px] font-semibold hover:underline"
                      >
                        + New Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION: Customer Repair Tickets & Audit Timeline */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
            Repair History
          </h2>
          <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold cursor-pointer hover:underline">
            View All {customer.totalRepairs} Tickets →
          </span>
        </div>

        <div className="space-y-2">
          {customer.repairHistory.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <span>No historical repair tickets on record for this customer.</span>
            </div>
          ) : (
            customer.repairHistory.map((item) => {
              const isActive =
                item.status === "Diagnosing" ||
                item.status === "Repairing" ||
                item.status === "In-Repair";

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                    isActive
                      ? "bg-sky-50/70 dark:bg-sky-950/30 border-l-4 border-l-sky-600 border-sky-200/80 dark:border-sky-900/60"
                      : "bg-zinc-50/80 dark:bg-zinc-800/40 border-zinc-200/70 dark:border-zinc-800/70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-sky-700 dark:text-sky-300">
                        {item.ticketNumber}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                          isActive
                            ? "bg-sky-100 dark:bg-sky-900/80 text-sky-800 dark:text-sky-200"
                            : "bg-zinc-200/80 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400">{item.date}</span>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-snug">
                    {item.problem}
                  </p>
                  <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 text-[11px] pt-1">
                    <span>Tech: {item.technician}</span>
                    {item.totalCost ? (
                      <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                        Total: {item.totalCost}
                      </span>
                    ) : item.bayOrQueue ? (
                      <span className="font-mono text-sky-600 dark:text-sky-400 font-medium">
                        {item.bayOrQueue}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 flex items-center justify-between border-t border-zinc-200/80 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => onArchiveCustomer(customer)}
          className="inline-flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archive Profile</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenCreateTicket(customer)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
        >
          <PlusSquare className="w-4 h-4" />
          <span>Create New Repair Ticket</span>
        </button>
      </div>
    </div>
  );
}
