import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { ImagePickerGrid, useSubmitRepairRequest } from '../../features/repair-requests';

export default function RepairRequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ deviceId: string; deviceName?: string }>();
  const deviceId = Array.isArray(params.deviceId) ? params.deviceId[0] : params.deviceId;
  const deviceName = Array.isArray(params.deviceName) ? params.deviceName[0] : params.deviceName;
  const { form, pickedImages, pickImages, removeImage, submit, isSubmitting, isSuccess, error } = useSubmitRepairRequest(deviceId ?? '');
  const { control, formState } = form;

  if (!deviceId) return <SafeAreaView className="flex-1 items-center justify-center"><Text>Device not found.</Text></SafeAreaView>;

  if (isSuccess) {
    return <SafeAreaView className="flex-1 items-center justify-center px-6"><Text className="text-xl font-bold text-on-surface">Request submitted</Text><Text className="mt-2 text-center text-on-surface-variant">Your repair request has been sent to the repair center.</Text><Pressable className="mt-6 min-h-[48px] w-full items-center justify-center rounded-lg bg-primary" onPress={() => router.back()}><Text className="font-semibold text-on-primary">Back to devices</Text></Pressable></SafeAreaView>;
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Pressable className="py-4" onPress={() => router.back()}><Text className="font-semibold text-primary">‹ Back</Text></Pressable>
        <Text className="text-2xl font-bold text-on-surface">Request a repair</Text>
        <Text className="mt-1 text-sm text-on-surface-variant">{deviceName ?? 'Selected device'}</Text>
        <Text className="mb-2 mt-6 text-sm font-semibold text-on-surface">Problem summary</Text>
        <Controller control={control} name="problem" rules={{ required: 'Describe the problem', minLength: { value: 3, message: 'Use at least 3 characters' }, maxLength: { value: 150, message: 'Use 150 characters or fewer' } }} render={({ field, fieldState }) => <><TextInput className="rounded-lg bg-surface-container px-4 py-3 text-on-surface" placeholder="What needs repair?" maxLength={150} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} />{fieldState.error ? <Text className="mt-1 text-xs text-error">{fieldState.error.message}</Text> : null}</>} />
        <Text className="mb-2 mt-5 text-sm font-semibold text-on-surface">Description</Text>
        <Controller control={control} name="description" rules={{ required: 'Add more detail', minLength: { value: 10, message: 'Use at least 10 characters' }, maxLength: { value: 2000, message: 'Use 2000 characters or fewer' } }} render={({ field, fieldState }) => <><TextInput className="min-h-[130px] rounded-lg bg-surface-container px-4 py-3 text-on-surface" placeholder="Tell us what happened…" multiline textAlignVertical="top" maxLength={2000} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} />{fieldState.error ? <Text className="mt-1 text-xs text-error">{fieldState.error.message}</Text> : null}</>} />
        <Text className="mb-2 mt-5 text-sm font-semibold text-on-surface">Images (optional)</Text>
        <ImagePickerGrid images={pickedImages} onAdd={pickImages} onRemove={removeImage} maxImages={5} />
        {error ? <Text className="mt-4 text-sm text-error">Could not submit the request. Please check your connection and try again.</Text> : null}
        <Pressable className="mt-7 min-h-[52px] items-center justify-center rounded-lg bg-primary" onPress={submit} disabled={isSubmitting || !formState.isValid && formState.isSubmitted}>
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-on-primary">Submit Request</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
