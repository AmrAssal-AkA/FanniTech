import React from "react";
import { View, Text } from "react-native";
import { Check, Cpu, Wrench, Package, ShieldCheck } from "lucide-react-native";
import { TimelineStep } from "../types";

interface RepairTimelineStepperProps {
  timeline: TimelineStep[];
  currentStage: number;
  totalStages: number;
}

export const RepairTimelineStepper: React.FC<RepairTimelineStepperProps> = ({
  timeline,
  currentStage,
  totalStages,
}) => {
  const getStepIcon = (step: TimelineStep) => {
    if (step.status === "completed") {
      return <Check size={14} color="#ffffff" strokeWidth={3} />;
    }
    if (step.status === "active") {
      return (
        <View className="w-2.5 h-2.5 rounded-full bg-on-secondary-container" />
      );
    }
    switch (step.key) {
      case "IN_REPAIR":
        return <Wrench size={14} color="#757682" />;
      case "READY_FOR_PICKUP":
        return <Package size={14} color="#757682" />;
      case "COMPLETED":
        return <ShieldCheck size={14} color="#757682" />;
      default:
        return <View className="w-2 h-2 rounded-full bg-outline" />;
    }
  };

  return (
    <View className="mx-4 my-2">
      <View className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container/80">
        {/* Header with step pill */}
        <View className="flex-row items-center justify-between pb-3">
          <Text className="text-base font-bold text-primary">
            Repair Timeline
          </Text>
          <View className="bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
            <Text className="text-xs font-semibold text-secondary">
              Step {currentStage} of {totalStages}
            </Text>
          </View>
        </View>

        {/* Stepper items list */}
        <View className="flex-col relative pl-2 pt-2">
          {timeline.map((step, index) => {
            const isLast = index === timeline.length - 1;
            const isCompleted = step.status === "completed";
            const isActive = step.status === "active";
            const isPending = step.status === "pending";

            return (
              <View
                key={step.key}
                className={`flex-row gap-3 relative ${isLast ? "" : "pb-6"} ${
                  isPending ? "opacity-65" : ""
                }`}
              >
                {/* Connecting Track Line */}
                {!isLast && (
                  <View
                    className={`absolute left-[13px] top-7 bottom-0 w-[2px] ${
                      isCompleted
                        ? "bg-secondary"
                        : "bg-surface-container-highest"
                    }`}
                  />
                )}

                {/* Node Circle */}
                <View
                  className={`w-7 h-7 rounded-full items-center justify-center shrink-0 z-10 shadow-xs ${
                    isCompleted
                      ? "bg-secondary text-on-secondary"
                      : isActive
                        ? "bg-secondary-container shadow-md"
                        : "bg-surface-container"
                  }`}
                >
                  {getStepIcon(step)}
                </View>

                {/* Node Content */}
                {isActive ? (
                  /* Active Stage Highlight Card */
                  <View className="flex-1 bg-surface-container-low p-3 rounded-lg -mt-1 border border-secondary/20">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-sm font-bold text-primary">
                          {step.title}
                        </Text>
                        <View className="bg-secondary px-1.5 py-0.5 rounded-full">
                          <Text className="text-[10px] font-bold text-on-secondary uppercase">
                            Active
                          </Text>
                        </View>
                      </View>
                      <Text className="text-xs font-semibold text-secondary font-mono">
                        {step.timestamp}
                      </Text>
                    </View>

                    <Text className="text-xs text-on-surface mt-1 leading-snug">
                      {step.description}
                    </Text>

                    {step.stationNote ? (
                      <View className="flex-row items-center gap-1.5 mt-2 pt-2 border-t border-surface-container-high/60">
                        <Cpu size={14} color="#0051d5" />
                        <Text className="text-[11px] font-medium text-on-surface-variant">
                          {step.stationNote}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  /* Standard / Completed / Upcoming Node */
                  <View className="flex-1 min-w-0">
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-sm ${
                          isCompleted
                            ? "font-bold text-on-surface"
                            : "font-semibold text-on-surface-variant"
                        }`}
                      >
                        {step.title}
                      </Text>
                      <Text className="text-xs text-on-surface-variant font-mono">
                        {step.timestamp}
                      </Text>
                    </View>
                    <Text className="text-xs text-on-surface-variant mt-0.5 leading-snug">
                      {step.description}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};
