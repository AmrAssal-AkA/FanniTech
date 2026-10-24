import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRegisterDevice } from "../hooks/useDevices";

interface RegisterDeviceValues {
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
}

interface RegisterDeviceSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const RegisterDeviceSheet: React.FC<RegisterDeviceSheetProps> = ({
  visible,
  onClose,
}) => {
  const { control, handleSubmit, reset } = useForm<RegisterDeviceValues>({
    defaultValues: { deviceType: "", brand: "", model: "", serialNumber: "" },
  });
  const mutation = useRegisterDevice();

  const submit = handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end bg-inverse-surface/40"
        onPress={onClose}
      >
        <Pressable
          className="rounded-t-2xl bg-surface-container-lowest p-6"
          onPress={(event) => event.stopPropagation()}
        >
          <Text className="mb-4 text-xl font-bold text-on-surface">
            Register Device
          </Text>
          {(["deviceType", "brand", "model", "serialNumber"] as const).map(
            (field) => (
              <Controller
                key={field}
                control={control}
                name={field}
                rules={
                  field === "serialNumber"
                    ? undefined
                    : { required: `${field} is required` }
                }
                render={({ field: input, fieldState }) => (
                  <View className="mb-3">
                    <TextInput
                      className="rounded-lg bg-surface-container px-4 py-3 text-on-surface"
                      placeholder={
                        field === "deviceType"
                          ? "Device type (e.g. Laptop)"
                          : field
                      }
                      value={input.value}
                      onChangeText={input.onChange}
                      onBlur={input.onBlur}
                      autoCapitalize="words"
                    />
                    {fieldState.error ? (
                      <Text className="mt-1 text-xs text-error">
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            ),
          )}
          {mutation.error ? (
            <Text className="mb-3 text-sm text-error">
              Could not register this device. Please try again.
            </Text>
          ) : null}
          <TouchableOpacity
            className="min-h-[48px] items-center justify-center rounded-lg bg-primary"
            onPress={submit}
            disabled={mutation.isPending}
          >
            <Text className="font-semibold text-on-primary">
              {mutation.isPending ? "Registering…" : "Register Device"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="mt-2 min-h-[48px] items-center justify-center"
            onPress={onClose}
          >
            <Text className="font-semibold text-primary">Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
