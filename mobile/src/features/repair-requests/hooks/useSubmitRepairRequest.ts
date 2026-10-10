import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RepairRequestsService } from '../services/RepairRequestsService';
import { REPAIR_REQUESTS_QUERY_KEY } from './useRepairRequests';
import { DEVICES_QUERY_KEY } from '../../devices/hooks/useDevices';

export const MAX_REPAIR_REQUEST_IMAGES = 5;

interface RepairRequestFormValues {
  problem: string;
  description: string;
}

export function useSubmitRepairRequest(deviceId: string) {
  const queryClient = useQueryClient();
  const form = useForm<RepairRequestFormValues>({ defaultValues: { problem: '', description: '' } });
  const [pickedImages, setPickedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: MAX_REPAIR_REQUEST_IMAGES - pickedImages.length,
    });
    if (!result.canceled) {
      setPickedImages((current) => [...current, ...result.assets].slice(0, MAX_REPAIR_REQUEST_IMAGES));
    }
  };

  const mutation = useMutation({
    mutationFn: (values: RepairRequestFormValues) =>
      RepairRequestsService.submitRequest({
        deviceId,
        ...values,
        images: pickedImages.map((image, index) => ({
          uri: image.uri,
          name: image.fileName ?? `repair-image-${index + 1}.jpg`,
          type: image.mimeType ?? 'image/jpeg',
        })),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REPAIR_REQUESTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DEVICES_QUERY_KEY });
    },
  });

  return {
    form,
    pickedImages,
    pickImages,
    removeImage: (uri: string) => setPickedImages((current) => current.filter((image) => image.uri !== uri)),
    submit: form.handleSubmit((values) => mutation.mutate(values)),
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
}
