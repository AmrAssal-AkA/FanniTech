import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Wrench, Clock } from 'lucide-react-native';
import { RecentActivityItem } from '../types';

interface RecentActivitySectionProps {
  activities: RecentActivityItem[];
  onSelectActivity?: (activityId: string) => void;
}

export const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  activities,
  onSelectActivity,
}) => {
  return (
    <View className="space-y-2.5">
      {/* Section Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-bold text-on-surface">
          Recent Requests & Activity
        </Text>
        <Text className="text-[11px] font-semibold text-outline uppercase tracking-wider">
          Audit Log
        </Text>
      </View>

      {/* Activity items list or empty state */}
      {activities.length === 0 ? (
        <View className="bg-surface-container-lowest rounded-2xl p-5 border border-slate-100 items-center justify-center">
          <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center mb-2">
            <Clock size={20} color="#757682" />
          </View>
          <Text className="text-sm font-semibold text-on-surface text-center">
            No Recent Activity
          </Text>
          <Text className="text-xs text-outline text-center mt-1">
            Your service requests and diagnostic tickets will appear here.
          </Text>
        </View>
      ) : (
        <View className="space-y-2">
          {activities.map((activity) => {
          const isAccepted = activity.status === 'ACCEPTED';

          return (
            <TouchableOpacity
              key={activity.id}
              onPress={() => onSelectActivity?.(activity.id)}
              activeOpacity={0.75}
              className="flex-row items-center justify-between p-3.5 bg-surface-container-lowest rounded-2xl border border-slate-100 shadow-xs"
              accessibilityLabel={`Request ${activity.requestNumber}, ${activity.deviceModel}, ${activity.statusLabel}`}
              accessibilityRole="button"
            >
              <View className="flex-row items-start gap-3 flex-1 min-w-0 mr-2">
                <View
                  className={`w-9 h-9 rounded-xl items-center justify-center shrink-0 mt-0.5 ${
                    isAccepted
                      ? 'bg-surface-container'
                      : 'bg-surface-container-high'
                  }`}
                >
                  {isAccepted ? (
                    <Wrench size={18} color="#0051d5" strokeWidth={2.2} />
                  ) : (
                    <Clock size={18} color="#757682" strokeWidth={2.2} />
                  )}
                </View>

                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center gap-1.5 flex-wrap">
                    <Text className="text-xs font-bold text-primary">
                      #{activity.requestNumber}
                    </Text>
                    <View className="w-1 h-1 rounded-full bg-outline-variant" />
                    <Text
                      className="text-xs font-semibold text-on-surface truncate"
                      numberOfLines={1}
                    >
                      {activity.deviceModel}
                    </Text>
                  </View>

                  <Text
                    className="text-xs text-on-surface-variant truncate mt-0.5"
                    numberOfLines={1}
                  >
                    {activity.issueDescription}
                  </Text>
                  <Text className="text-[11px] text-outline mt-0.5">
                    {activity.date}
                  </Text>
                </View>
              </View>

              <View className="shrink-0 pl-1">
                <View
                  className={`px-2.5 py-1 rounded-full ${
                    isAccepted
                      ? 'bg-secondary-fixed'
                      : 'bg-surface-container-highest'
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold tracking-wide ${
                      isAccepted
                        ? 'text-secondary-fixed-variant'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    {activity.statusLabel}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      )}
      </View>
  );
};
