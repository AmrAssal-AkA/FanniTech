import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ApiRepairRequest } from '../types';

export const RepairRequestCard: React.FC<{ request: ApiRepairRequest; onCancel?: () => void; isCancelling?: boolean }> = ({ request, onCancel, isCancelling }) => (
  <View className="mb-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
    <View className="flex-row items-center justify-between">
      <Text className="flex-1 text-base font-bold text-on-surface" numberOfLines={1}>{request.problem}</Text>
      <Text className="ml-2 rounded-full bg-primary-container px-2 py-1 text-xs font-semibold text-on-primary">{request.status}</Text>
    </View>
    <Text className="mt-2 text-sm text-on-surface-variant" numberOfLines={2}>{request.description}</Text>
    <Text className="mt-2 text-xs text-outline">{new Date(request.createdAt).toLocaleDateString()}</Text>
    {request.status === 'PENDING' && onCancel ? (
      <TouchableOpacity className="mt-3 min-h-[40px] items-center justify-center rounded-lg bg-error-container" onPress={onCancel} disabled={isCancelling}>
        <Text className="text-xs font-semibold text-on-error-container">{isCancelling ? 'Cancelling…' : 'Cancel request'}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);
