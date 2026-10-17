import { Flame, Activity, Video } from "lucide-react";
import type { RigDevice } from "@/types/technicianDashboard";

interface BenchRigTelemetryProps {
  devices?: RigDevice[];
}

export function BenchRigTelemetry({
  devices = [
    {
      name: "Hakko FX-951",
      spec: "Tip: T12-BC2 · Standby",
      value: "380°C",
      statusLabel: "ONLINE",
      isOnline: true,
    },
    {
      name: "Rigol DS1054Z",
      spec: "USB CH1: Active 100MHz",
      value: "Connected",
      statusLabel: "LINKED",
      isOnline: true,
    },
    {
      name: "FLIR ETS320 Bench",
      spec: "320x240 Sensor IR",
      value: "78.4°C Peak",
      statusLabel: "LIVE STREAM",
      isOnline: true,
    },
  ],
}: BenchRigTelemetryProps) {
  const getDeviceIcon = (name: string) => {
    if (name.toLowerCase().includes("hakko") || name.toLowerCase().includes("solder")) {
      return <Flame className="w-4 h-4 text-amber-500" />;
    }
    if (name.toLowerCase().includes("rigol") || name.toLowerCase().includes("oscillo")) {
      return <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
    }
    return <Video className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="flex flex-col p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Bench Rig Telemetry
          </h3>
        </div>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      <div className="flex flex-col gap-2 mt-3">
        {devices.map((device) => (
          <div
            key={device.name}
            className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-750"
          >
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-white dark:bg-zinc-700/80 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700 shadow-2xs">
                {getDeviceIcon(device.name)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {device.name}
                </span>
                <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                  {device.spec}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {device.value}
              </span>
              <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400">
                {device.statusLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

