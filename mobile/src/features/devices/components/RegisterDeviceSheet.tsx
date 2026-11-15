import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { AlertCircle, Laptop, Plus, X } from 'lucide-react-native';
import { useRegisterDevice } from '../hooks/useDevices';

interface RegisterDeviceValues {
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
}

export interface RegisterDeviceSheetProps {
  visible: boolean;
  onClose: () => void;
}

const DEVICE_TYPE_PRESETS = ['Laptop', 'Smartphone', 'Tablet', 'Desktop'] as const;

const DEFAULT_VALUES: RegisterDeviceValues = {
  deviceType: '',
  brand: '',
  model: '',
  serialNumber: '',
};

export const RegisterDeviceSheet: React.FC<RegisterDeviceSheetProps> = ({
  visible,
  onClose,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterDeviceValues>({
    defaultValues: DEFAULT_VALUES,
  });

  const mutation = useRegisterDevice();

  const deviceTypeRef = useRef<TextInput>(null);
  const brandRef = useRef<TextInput>(null);
  const modelRef = useRef<TextInput>(null);
  const serialNumberRef = useRef<TextInput>(null);

  const selectedDeviceType = watch('deviceType');

  useEffect(() => {
    if (!visible) {
      reset(DEFAULT_VALUES);
      mutation.reset();
    }
  }, [visible, reset]);

  const handleClose = () => {
    if (mutation.isPending) return;
    Keyboard.dismiss();
    onClose();
  };

  const submit = handleSubmit((values) => {
    Keyboard.dismiss();
    const trimmedSerial = values.serialNumber.trim();
    mutation.mutate(
      {
        deviceType: values.deviceType.trim(),
        brand: values.brand.trim(),
        model: values.model.trim(),
        ...(trimmedSerial ? { serialNumber: trimmedSerial } : {}),
      },
      {
        onSuccess: () => {
          reset(DEFAULT_VALUES);
          onClose();
        },
      },
    );
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center items-center px-4"
      >
        <Pressable
          className="absolute inset-0 bg-inverse-surface/50"
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss add device popup"
        />

        <View className="w-full max-w-md max-h-[88%] rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-xl overflow-hidden">
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-outline-variant/30">
            <View className="flex-row items-center gap-3 flex-1 min-w-0">
              <View className="w-10 h-10 rounded-xl bg-surface-container items-center justify-center">
                <Laptop size={20} color="#00236f" />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-lg font-bold text-on-surface">
                  Add Broken Device
                </Text>
                <Text className="text-xs text-on-surface-variant">
                  Enter device details to request a repair
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              disabled={mutation.isPending}
              activeOpacity={0.7}
              className="w-11 h-11 rounded-full bg-surface-container-low items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Close add device popup"
            >
              <X size={18} color="#444651" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            bounces={false}
          >
            <View className="p-5 gap-4">
              <View className="gap-2">
                <Text className="text-xs font-semibold uppercase tracking-wider text-outline">
                  Device Type *
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {DEVICE_TYPE_PRESETS.map((preset) => {
                    const isSelected =
                      selectedDeviceType.trim().toLowerCase() ===
                      preset.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={preset}
                        onPress={() => {
                          setValue('deviceType', preset, {
                            shouldValidate: true,
                          });
                          brandRef.current?.focus();
                        }}
                        activeOpacity={0.8}
                        className={`px-3.5 py-2 rounded-lg border ${
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'bg-surface-container-low border-outline-variant/50'
                        }`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected }}
                        accessibilityLabel={`Select ${preset} device type`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            isSelected ? 'text-on-primary' : 'text-on-surface'
                          }`}
                        >
                          {preset}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Controller
                  control={control}
                  name="deviceType"
                  rules={{
                    validate: (value) =>
                      value.trim().length > 0 || 'Device type is required',
                  }}
                  render={({ field }) => (
                    <View>
                      <TextInput
                        ref={deviceTypeRef}
                        className={`h-[48px] rounded-xl px-4 text-sm text-on-surface bg-surface-container-low border ${
                          errors.deviceType
                            ? 'border-error'
                            : 'border-outline-variant/40'
                        }`}
                        placeholder="Or type another (e.g. Gaming Console)"
                        placeholderTextColor="#757682"
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        autoCapitalize="words"
                        returnKeyType="next"
                        blurOnSubmit={false}
                        onSubmitEditing={() => brandRef.current?.focus()}
                        accessibilityLabel="Device type input"
                      />
                      {errors.deviceType ? (
                        <Text className="mt-1 text-xs text-error">
                          {errors.deviceType.message}
                        </Text>
                      ) : null}
                    </View>
                  )}
                />
              </View>

              <Controller
                control={control}
                name="brand"
                rules={{
                  validate: (value) =>
                    value.trim().length > 0 || 'Brand is required',
                }}
                render={({ field, fieldState }) => (
                  <View className="gap-1.5">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-outline">
                      Brand *
                    </Text>
                    <TextInput
                      ref={brandRef}
                      className={`h-[48px] rounded-xl px-4 text-sm text-on-surface bg-surface-container-low border ${
                        fieldState.error
                          ? 'border-error'
                          : 'border-outline-variant/40'
                      }`}
                      placeholder="e.g. Apple, Lenovo, Samsung"
                      placeholderTextColor="#757682"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      autoCapitalize="words"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => modelRef.current?.focus()}
                      accessibilityLabel="Brand input"
                    />
                    {fieldState.error ? (
                      <Text className="text-xs text-error">
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="model"
                rules={{
                  validate: (value) =>
                    value.trim().length > 0 || 'Model is required',
                }}
                render={({ field, fieldState }) => (
                  <View className="gap-1.5">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-outline">
                      Model *
                    </Text>
                    <TextInput
                      ref={modelRef}
                      className={`h-[48px] rounded-xl px-4 text-sm text-on-surface bg-surface-container-low border ${
                        fieldState.error
                          ? 'border-error'
                          : 'border-outline-variant/40'
                      }`}
                      placeholder="e.g. MacBook Pro 14, ThinkPad T14"
                      placeholderTextColor="#757682"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      autoCapitalize="words"
                      autoCorrect={false}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => serialNumberRef.current?.focus()}
                      accessibilityLabel="Model input"
                    />
                    {fieldState.error ? (
                      <Text className="text-xs text-error">
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />

              <Controller
                control={control}
                name="serialNumber"
                render={({ field }) => (
                  <View className="gap-1.5">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-outline">
                      Serial Number (Optional)
                    </Text>
                    <TextInput
                      ref={serialNumberRef}
                      className="h-[48px] rounded-xl px-4 text-sm text-on-surface bg-surface-container-low border border-outline-variant/40"
                      placeholder="e.g. C02G4591MD6R"
                      placeholderTextColor="#757682"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={submit}
                      accessibilityLabel="Serial number input"
                    />
                  </View>
                )}
              />

              {mutation.error ? (
                <View className="flex-row items-center gap-2 rounded-xl bg-error-container px-3.5 py-2.5">
                  <AlertCircle size={16} color="#93000a" />
                  <Text className="flex-1 text-xs font-medium text-on-error-container">
                    Could not register this device. Please try again.
                  </Text>
                </View>
              ) : null}

              <View className="gap-2 pt-1">
                <TouchableOpacity
                  className="min-h-[48px] flex-row items-center justify-center gap-2 rounded-xl bg-primary"
                  onPress={submit}
                  disabled={mutation.isPending}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Add broken device"
                >
                  {mutation.isPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Plus size={18} color="#ffffff" />
                  )}
                  <Text className="text-sm font-bold text-on-primary">
                    {mutation.isPending ? 'Adding Device…' : 'Add Device'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="min-h-[48px] items-center justify-center rounded-xl bg-surface-container"
                  onPress={handleClose}
                  disabled={mutation.isPending}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Text className="text-sm font-semibold text-on-surface">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
