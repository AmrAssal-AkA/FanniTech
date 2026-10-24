import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { RepairTicketStatus } from '../types';
import { getLifecycleMetrics } from '../hooks/useRepairTicket';

interface DiagnosticHeroCardProps {
  status: RepairTicketStatus;
  statusDescription: string;
}

export const DiagnosticHeroCard: React.FC<DiagnosticHeroCardProps> = ({
  status,
  statusDescription,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const metrics = getLifecycleMetrics(status);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    const animation = Animated.loop(
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
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const statusLabel = status
    ? `CURRENT STATUS: ${String(status).replace(/_/g, ' ')}`
    : 'CURRENT STATUS: PENDING REVIEW';

  const isTerminalError = status === 'UNREPAIRABLE' || status === 'CANCELLED';
  const isCompleted = status === 'COMPLETED';

  const stageSubtext = isCompleted
    ? 'All 5 Stages Completed • 100%'
    : isTerminalError
    ? `${metrics.stageName} • Final Resolution`
    : `Stage ${metrics.stage} of ${metrics.totalStages} • ${metrics.stageName}`;

  return (
    <View className="mx-4 my-2">
      <View className="bg-primary-container rounded-xl p-4 shadow-md relative overflow-hidden">
        {/* Ambient circuit watermark decoration */}
        <View
          pointerEvents="none"
          className="absolute -right-4 -bottom-4 w-32 h-32 opacity-15"
        >
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r="40"
              stroke="#ffffff"
              strokeWidth="2.5"
              fill="none"
            />
            <Path
              d="M50 10 L50 35 M50 65 L50 90 M10 50 L35 50 M65 50 L90 50"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            <Circle cx="50" cy="50" r="8" fill="#ffffff" />
          </Svg>
        </View>

        {/* Content */}
        <View className="relative z-10 flex-col gap-2">
          {/* Status pill with glowing dot & stage info */}
          <View className="flex-row items-center justify-between">
            <View
              className={`flex-row items-center gap-2 self-start px-3 py-1 rounded-full ${
                isTerminalError
                  ? 'bg-error/80'
                  : isCompleted
                  ? 'bg-secondary'
                  : 'bg-secondary/80'
              }`}
            >
              <Animated.View
                style={{ opacity: isTerminalError ? 1 : pulseAnim }}
                className={`w-2 h-2 rounded-full ${
                  isTerminalError
                    ? 'bg-on-error'
                    : 'bg-tertiary-fixed-dim'
                }`}
              />
              <Text className="text-xs font-bold text-on-secondary uppercase tracking-wider">
                {statusLabel}
              </Text>
            </View>

            <Text className="text-[11px] font-semibold text-secondary-fixed font-mono">
              {metrics.progressPercent}%
            </Text>
          </View>

          {/* Lifecycle stage description banner */}
          <Text className="text-xs font-semibold text-secondary-fixed/90 uppercase tracking-wide">
            {stageSubtext}
          </Text>

          {/* Description */}
          <Text className="text-sm text-surface-container-high leading-relaxed pt-1 font-normal">
            {statusDescription}
          </Text>

          {/* Dynamic pulse progress bar */}
          <View className="w-full bg-primary/60 h-2 rounded-full overflow-hidden mt-2">
            <View
              className={`h-full rounded-full relative ${
                isTerminalError ? 'bg-error' : 'bg-tertiary-fixed-dim'
              }`}
              style={{ width: `${metrics.progressPercent}%` }}
            >
              {!isTerminalError && (
                <Animated.View
                  style={{ opacity: pulseAnim }}
                  className="absolute inset-0 bg-white/40"
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
