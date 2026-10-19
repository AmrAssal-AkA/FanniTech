import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ApiRepairRequest } from '../types';

export const RepairRequestCard: React.FC<{
  request: ApiRepairRequest;
  onCancel?: () => void;
  isCancelling?: boolean;
  onTrackRepair?: (requestId: string) => void;
}> = ({ request, onCancel, isCancelling, onTrackRepair }) => (
  <View className="mb-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm border border-slate-100">
    <View className="flex-row items-center justify-between">
      <Text className="flex-1 text-base font-bold text-on-surface" numberOfLines={1}>
        {request.problem}
      </Text>
      <Text className="ml-2 rounded-full bg-primary-container px-2 py-1 text-xs font-semibold text-on-primary">
        {request.status}
      </Text>
    </View>
    <Text className="mt-2 text-sm text-on-surface-variant" numberOfLines={2}>
      {request.description}
    </Text>
    <View className="mt-2 flex-row items-center justify-between">
      <Text className="text-xs text-outline">
        {new Date(request.createdAt).toLocaleDateString()}
      </Text>
      {request.repairTicket?.ticketNumber ? (
        <Text className="text-xs font-bold text-secondary font-mono">
          #{request.repairTicket.ticketNumber}
        </Text>
      ) : null}
    </View>
    <View className="mt-3 flex-row items-center gap-2">
      {onTrackRepair ? (
        <TouchableOpacity
          className="flex-1 min-h-[40px] items-center justify-center rounded-lg bg-primary active:opacity-90"
          onPress={() => onTrackRepair(request.id)}
          accessibilityLabel="Track Repair"
          accessibilityRole="button"
          testID="track-repair-button"
        >
          <Text className="text-xs font-semibold text-on-primary">Track Repair</Text>
        </TouchableOpacity>
      ) : null}
      {request.status === 'PENDING' && onCancel ? (
        <TouchableOpacity
          className="min-h-[40px] px-3 items-center justify-center rounded-lg bg-error-container"
          onPress={onCancel}
          disabled={isCancelling}
          accessibilityLabel="Cancel request"
          accessibilityRole="button"
        >
          <Text className="text-xs font-semibold text-on-error-container">
            {isCancelling ? 'Cancelling…' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);
