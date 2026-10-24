import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Laptop, Clock, Wrench, ArrowRight, Check } from 'lucide-react-native';
import { ActiveRepairTicket, RepairStage } from '../types';

interface ActiveRepairCardProps {
  ticket: ActiveRepairTicket;
  onPressDetails?: (ticketId: string) => void;
}

const STAGES: { stage: RepairStage; label: string }[] = [
  { stage: 1, label: 'Accepted' },
  { stage: 2, label: 'Diagnosing' },
  { stage: 3, label: 'In Repair' },
  { stage: 4, label: 'Ready' },
  { stage: 5, label: 'Done' },
];

export const ActiveRepairCard: React.FC<ActiveRepairCardProps> = ({
  ticket,
  onPressDetails,
}) => {
  const currentStage = ticket.currentStage;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulseAnim]);

  return (
    <View className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
      {/* Accent subtle top highlight stripe */}
      <View className="absolute top-0 left-0 right-0 h-1 bg-secondary" />

      {/* Ticket serial & status badge */}
      <View className="flex-row items-center justify-between mt-1 mb-3">
        <View className="flex-row items-center gap-2">
          <View className="bg-surface-container px-2 py-0.5 rounded">
            <Text className="text-xs font-bold text-primary">
              #{ticket.ticketNumber}
            </Text>
          </View>
          <Text className="text-[11px] font-semibold text-outline">
            {ticket.priorityLabel}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container shadow-xs">
          <Animated.View
            style={{ opacity: pulseAnim }}
            className="w-2 h-2 rounded-full bg-tertiary-fixed"
          />
          <Text className="text-xs font-bold tracking-wider text-on-secondary-container">
            {ticket.statusLabel}
          </Text>
        </View>
      </View>

      {/* Device specs & problem summary */}
      <View className="flex-row items-start gap-3 mb-4">
        <View className="w-12 h-12 rounded-xl bg-surface-container items-center justify-center shrink-0">
          <Laptop size={24} color="#00236f" strokeWidth={2} />
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-base font-bold text-on-surface leading-snug">
            {ticket.deviceModel}
          </Text>
          <Text
            className="text-xs text-on-surface-variant mt-0.5 leading-4"
            numberOfLines={2}
          >
            {ticket.reportedIssue}
          </Text>
        </View>
      </View>

      {/* 5-Stage Horizontal Progress Tracker */}
      <View className="bg-surface-container-low rounded-xl p-3 mb-4">
        <View className="flex-row items-center justify-between relative mb-2 px-2">
          {/* Background track line */}
          <View className="absolute left-6 right-6 top-1/2 -mt-0.5 h-1 bg-surface-container-highest" />

          {/* Active progress track line */}
          {currentStage > 1 && (
            <View
              className="absolute left-6 top-1/2 -mt-0.5 h-1 bg-secondary"
              style={{
                width: `${((currentStage - 1) / (STAGES.length - 1)) * 88}%`,
              }}
            />
          )}

          {/* Steps */}
          {STAGES.map((s) => {
            const isCompleted = s.stage < currentStage || (currentStage === 5 && s.stage === 5);
            const isCurrent = s.stage === currentStage && currentStage !== 5;

            return (
              <View key={s.stage} className="items-center z-10">
                {isCompleted ? (
                  <View className="w-6 h-6 rounded-full bg-secondary items-center justify-center shadow-xs">
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  </View>
                ) : isCurrent ? (
                  <View className="w-6 h-6 rounded-full bg-primary-container items-center justify-center shadow-xs">
                    <Animated.View
                      style={{ opacity: pulseAnim }}
                      className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed"
                    />
                  </View>
                ) : (
                  <View className="w-5 h-5 rounded-full bg-surface-container-highest items-center justify-center">
                    <View className="w-1.5 h-1.5 rounded-full bg-outline" />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Stage Labels */}
        <View className="flex-row items-center justify-between">
          {STAGES.map((s) => {
            const isCompleted = s.stage < currentStage;
            const isCurrent = s.stage === currentStage;

            const textStyle = isCompleted
              ? 'text-secondary font-semibold'
              : isCurrent
              ? 'text-primary font-bold'
              : 'text-outline font-medium';

            return (
              <Text
                key={s.stage}
                className={`text-[10px] text-center w-14 ${textStyle}`}
                numberOfLines={1}
              >
                {s.label}
              </Text>
            );
          })}
        </View>
      </View>

      {/* Telemetry and Assigned Technician Row */}
      <View className="flex-row items-center justify-between bg-surface-container/60 rounded-xl p-3 mb-4">
        <View className="flex-1 mr-2">
          <Text className="text-[11px] font-semibold text-outline">
            Est. Diagnosis
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Clock size={13} color="#0051d5" />
            <Text className="text-xs font-bold text-on-surface">
              {ticket.estimatedDiagnosisTime}
            </Text>
          </View>
        </View>

        <View className="h-7 w-[1px] bg-outline-variant/40 mx-1" />

        <View className="flex-1 ml-2">
          <Text className="text-[11px] font-semibold text-outline">
            Assigned Technician
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Wrench size={13} color="#00236f" />
            <Text className="text-xs font-bold text-on-surface" numberOfLines={1}>
              {ticket.assignedTechnician}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={() => onPressDetails?.(ticket.id)}
        activeOpacity={0.8}
        className="w-full h-12 bg-primary rounded-xl flex-row items-center justify-center gap-2 shadow-sm"
        accessibilityLabel="View ticket details"
        accessibilityRole="button"
      >
        <Text className="text-sm font-semibold text-on-primary">
          View Ticket Details
        </Text>
        <ArrowRight size={16} color="#ffffff" strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
};
