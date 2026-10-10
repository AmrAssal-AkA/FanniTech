import React from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RepairRequestCard, useCancelRepairRequest, useGetRepairRequests } from '../../features/repair-requests';

export default function RepairRequestsListScreen() {
  const router = useRouter();
  const query = useGetRepairRequests();
  const cancelMutation = useCancelRepairRequest();
  const requests = query.data?.data ?? [];

  return <SafeAreaView className="flex-1 bg-surface px-4" edges={['top', 'left', 'right']}>
    <Pressable className="py-4" onPress={() => router.back()}><Text className="font-semibold text-primary">‹ Back</Text></Pressable>
    <Text className="mb-4 text-2xl font-bold text-on-surface">Repair requests</Text>
    {query.isLoading ? <ActivityIndicator size="large" color="#0051d5" /> : query.isError ? <View className="items-center"><Text className="text-on-surface">Could not load repair requests.</Text><Pressable className="mt-3 rounded-lg bg-surface-container px-4 py-3" onPress={() => void query.refetch()}><Text className="font-semibold text-primary">Try again</Text></Pressable></View> : <FlatList data={requests} keyExtractor={(item) => item.id} renderItem={({ item }) => <RepairRequestCard request={item} onCancel={() => cancelMutation.mutate(item.id)} isCancelling={cancelMutation.isPending && cancelMutation.variables === item.id} />} ListEmptyComponent={<Text className="mt-10 text-center text-on-surface-variant">No repair requests yet.</Text>} />}
  </SafeAreaView>;
}
