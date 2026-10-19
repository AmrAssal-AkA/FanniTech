import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Controller } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Droplets,
  Flame,
  Laptop,
  Monitor,
  MonitorX,
  PlusCircle,
  Power,
  RotateCcw,
  Smartphone,
  Store,
  User,
  Wrench,
  X,
} from "lucide-react-native";

import {
  ImagePickerGrid,
  RepairRequestCard,
  useSubmitRepairRequest,
} from "../../features/repair-requests";
import {
  ApiDevice,
  RegisterDeviceSheet,
  useGetDevices,
} from "../../features/devices";

interface QuickIssueChip {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
}

const QUICK_ISSUES: QuickIssueChip[] = [
  { id: "power", label: "Does not turn on", icon: Power },
  { id: "shutdown", label: "Random shut downs", icon: RotateCcw },
  { id: "screen", label: "Screen cracked / black", icon: MonitorX },
  { id: "liquid", label: "Liquid spill", icon: Droplets },
  { id: "overheating", label: "Overheating / Loud fan", icon: Flame },
];

function getDeviceIcon(deviceType?: string) {
  const type = (deviceType || "").toLowerCase();
  if (type.includes("laptop") || type.includes("macbook") || type.includes("notebook")) {
    return Laptop;
  }
  if (type.includes("desktop") || type.includes("pc") || type.includes("tower") || type.includes("workstation")) {
    return Monitor;
  }
  if (type.includes("phone") || type.includes("mobile") || type.includes("tablet") || type.includes("ipad")) {
    return Smartphone;
  }
  return Cpu;
}

const TAB_BAR_HEIGHT = 64;
const TAB_BAR_BOTTOM = 24;
const NAV_BAR_TOTAL_HEIGHT = TAB_BAR_HEIGHT + TAB_BAR_BOTTOM;

export default function RepairRequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const navBarClearance =
    Math.max(insets.bottom + TAB_BAR_HEIGHT, NAV_BAR_TOTAL_HEIGHT) + 12;

  const params = useLocalSearchParams<{
    deviceId?: string;
    deviceName?: string;
  }>();

  const initialDeviceId = Array.isArray(params.deviceId)
    ? params.deviceId[0]
    : params.deviceId;
  const initialDeviceName = Array.isArray(params.deviceName)
    ? params.deviceName[0]
    : params.deviceName;

  const { data: registeredDevices = [], isLoading: isLoadingDevices } =
    useGetDevices();

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(
    initialDeviceId || ""
  );
  const [isRegisterSheetVisible, setRegisterSheetVisible] = useState(false);
  const [prevDeviceCount, setPrevDeviceCount] = useState(
    registeredDevices.length
  );

  // Sync selected device if devices change or newly registered
  useEffect(() => {
    if (registeredDevices.length > 0) {
      if (!selectedDeviceId) {
        setSelectedDeviceId(initialDeviceId || registeredDevices[0].id);
      } else if (registeredDevices.length > prevDeviceCount) {
        // A new device was added: auto-select the latest one
        const newest = registeredDevices[registeredDevices.length - 1];
        if (newest) setSelectedDeviceId(newest.id);
      }
    }
    setPrevDeviceCount(registeredDevices.length);
  }, [registeredDevices, initialDeviceId, selectedDeviceId, prevDeviceCount]);

  const selectedDevice = useMemo(() => {
    return (
      registeredDevices.find((d) => d.id === selectedDeviceId) ||
      (initialDeviceId && initialDeviceName
        ? ({
            id: initialDeviceId,
            brand: initialDeviceName.split(" ")[0] || "Device",
            model: initialDeviceName.split(" ").slice(1).join(" ") || "System",
            deviceType: "Hardware",
            serialNumber: initialDeviceId,
            customerId: "",
            createdAt: "",
            updatedAt: "",
          } as ApiDevice)
        : null)
    );
  }, [registeredDevices, selectedDeviceId, initialDeviceId, initialDeviceName]);

  const {
    form,
    pickedImages,
    pickImages,
    removeImage,
    submitWithDevice,
    isSubmitting,
    isSuccess,
    submittedRequest,
    error,
    reset,
  } = useSubmitRepairRequest(selectedDeviceId);

  const { control, setValue, watch } = form;
  const problemValue = watch("problem") || "";
  const descriptionValue = watch("description") || "";

  const handleChipPress = (issueLabel: string) => {
    if (problemValue === issueLabel) {
      setValue("problem", "", { shouldValidate: true, shouldDirty: true });
    } else {
      setValue("problem", issueLabel, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleClearProblem = () => {
    setValue("problem", "", { shouldValidate: true, shouldDirty: true });
  };

  const handleSubmit = () => {
    if (!selectedDeviceId) return;
    submitWithDevice(selectedDeviceId);
  };

  // SUCCESS STATE
  if (isSuccess) {
    const handleTrackRepair = () => {
      const reqId = submittedRequest?.id;
      const ticketNum = submittedRequest?.repairTicket?.ticketNumber;
      reset();
      if (reqId) {
        router.push({
          pathname: "/(app)/RepairTicketScreen",
          params: {
            requestId: reqId,
            ...(ticketNum ? { ticketNumber: ticketNum } : {}),
          },
        });
      } else {
        router.push("/(app)/RepairRequestsListScreen" as never);
      }
    };

    return (
      <SafeAreaView
        className="flex-1 w-full h-full bg-surface"
        edges={["top", "left", "right"]}
      >
        <ScrollView
          className="flex-1 w-full"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: navBarClearance + 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md mx-auto items-center">
            <View className="mb-5 h-20 w-20 items-center justify-center rounded-full bg-secondary-fixed">
              <CheckCircle2 size={44} color="#0051d5" />
            </View>

            <Text className="text-center text-2xl font-bold tracking-tight text-on-surface">
              Request Submitted
            </Text>

            <Text className="mt-2.5 text-center text-sm leading-6 text-on-surface-variant">
              Your repair request has been successfully registered. Our bench
              technicians will review the issue and prepare your diagnostic ticket.
            </Text>

            {/* Request card with track repair button */}
            {submittedRequest ? (
              <View className="mt-6 w-full">
                <RepairRequestCard
                  request={submittedRequest}
                  onTrackRepair={handleTrackRepair}
                />
              </View>
            ) : (
              <View className="mt-6 w-full rounded-2xl bg-surface-container-lowest p-4 shadow-sm border border-outline-variant/30">
                <View className="flex-row items-center justify-between pb-3 border-b border-surface-container">
                  <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Target Device
                  </Text>
                  <Text className="text-xs font-bold text-secondary">
                    {selectedDevice
                      ? `${selectedDevice.brand} ${selectedDevice.model}`
                      : "Registered Device"}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between pt-3">
                  <Text className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Initial Status
                  </Text>
                  <View className="rounded-full bg-secondary/10 px-2.5 py-0.5">
                    <Text className="text-xs font-bold text-secondary">
                      PENDING REVIEW
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Action buttons */}
            <View className="mt-6 w-full gap-3">
              <Pressable
                testID="track-repair-button"
                className="min-h-[50px] w-full flex-row items-center justify-center rounded-xl bg-primary active:opacity-90 shadow-sm"
                onPress={handleTrackRepair}
                accessibilityLabel="Track Repair"
                accessibilityRole="button"
              >
                <Text className="font-semibold text-on-primary">
                  Track Repair
                </Text>
                <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />
              </Pressable>

              <Pressable
                className="min-h-[48px] w-full items-center justify-center rounded-xl bg-surface-container active:bg-surface-container-high"
                onPress={() => {
                  reset();
                  router.push("/(app)/RepairRequestsListScreen" as never);
                }}
                accessibilityLabel="View All Repairs"
                accessibilityRole="button"
              >
                <Text className="font-semibold text-on-surface">
                  View All Repairs
                </Text>
              </Pressable>

              <Pressable
                className="min-h-[44px] w-full items-center justify-center rounded-xl active:bg-surface-container-low"
                onPress={() => {
                  reset();
                  router.back();
                }}
                accessibilityLabel="Back to Devices"
                accessibilityRole="button"
              >
                <Text className="text-sm font-medium text-on-surface-variant">
                  Back to Devices
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 w-full h-full bg-surface"
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 w-full"
      >
        {/* TOP APP HEADER */}
        <View className="w-full border-b border-surface-container-high/60 bg-surface/90 px-4">
          <View className="h-14 w-full max-w-md mx-auto flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => router.back()}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                className="-ml-1 h-10 w-10 items-center justify-center rounded-full active:bg-surface-container"
              >
                <ArrowLeft size={22} color="#131b2e" />
              </TouchableOpacity>
              <Text className="text-lg font-bold tracking-tight text-on-surface">
                Book Service
              </Text>
            </View>

            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full bg-primary"
              onPress={() => router.push("/(app)/ProfileScreen" as never)}
              accessibilityLabel="User Profile"
              accessibilityRole="button"
            >
              <User size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SCROLLABLE FORM CONTENT */}
        <ScrollView
          className="flex-1 w-full"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md mx-auto">
          {/* STEPPER & PROGRESS HEADER */}
          <View className="mb-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Step 1 of 2
              </Text>
              <Text className="text-xs font-semibold text-on-surface-variant">
                Intake v1.0
              </Text>
            </View>

            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-xl font-bold tracking-tight text-on-surface">
                Device & Problem Details
              </Text>
              <View className="flex-row items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-0.5">
                <View className="h-1.5 w-1.5 rounded-full bg-secondary" />
                <Text className="text-xs font-bold text-on-surface-variant">
                  50%
                </Text>
              </View>
            </View>

            {/* Track progress */}
            <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
              <View className="h-full w-1/2 rounded-full bg-secondary" />
            </View>
          </View>

          {/* FORM CONTAINER */}
          <View className="gap-6">
            {/* SECTION 1: SELECT REGISTERED DEVICE */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-container">
                    <Text className="text-xs font-bold text-on-primary">1</Text>
                  </View>
                  <Text className="text-base font-bold text-on-surface">
                    Select Registered Device
                  </Text>
                </View>
                <Text className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  Required
                </Text>
              </View>

              {/* Devices Selection List */}
              {isLoadingDevices ? (
                <View className="items-center justify-center py-6">
                  <ActivityIndicator color="#0051d5" />
                </View>
              ) : registeredDevices.length === 0 ? (
                <View className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-4 text-center">
                  <Text className="text-center text-sm text-on-surface-variant">
                    No registered devices found. Add your device below to proceed.
                  </Text>
                </View>
              ) : (
                <View className="gap-2.5">
                  {registeredDevices.map((device) => {
                    const isSelected = selectedDeviceId === device.id;
                    const DeviceIconComponent = getDeviceIcon(device.deviceType);

                    return (
                      <Pressable
                        key={device.id}
                        onPress={() => setSelectedDeviceId(device.id)}
                        className={`flex-row items-start rounded-xl p-3.5 shadow-sm transition-all ${
                          isSelected
                            ? "border border-secondary/30 bg-surface-container-low shadow-sm"
                            : "border border-transparent bg-surface-container-lowest"
                        }`}
                        accessibilityLabel={`Select ${device.brand} ${device.model}`}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: isSelected }}
                      >
                        {/* Radio Checkmark */}
                        <View
                          className={`mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full ${
                            isSelected
                              ? "bg-secondary text-on-secondary"
                              : "bg-surface-container"
                          }`}
                        >
                          {isSelected ? (
                            <Check size={14} color="#ffffff" strokeWidth={3} />
                          ) : null}
                        </View>

                        {/* Device Info */}
                        <View className="flex-1 pr-2">
                          <View className="mb-0.5 flex-row items-center gap-2">
                            <Text
                              className="text-sm font-bold text-on-surface truncate"
                              numberOfLines={1}
                            >
                              {device.brand} {device.model}
                            </Text>
                            <View className="rounded-full bg-surface-container-high px-2 py-0.5">
                              <Text className="text-[11px] font-semibold text-on-surface-variant">
                                {device.deviceType || "Device"}
                              </Text>
                            </View>
                          </View>

                          <View className="flex-row items-center gap-1.5 text-on-surface-variant">
                            <Cpu size={13} color="#444651" />
                            <Text className="text-xs font-medium text-on-surface-variant">
                              {device.serialNumber ||
                                `ID-${device.id.slice(0, 8)}`}
                            </Text>
                            <Text className="text-xs text-outline-variant">
                              •
                            </Text>
                            <Text className="text-xs font-semibold text-secondary">
                              Registered Unit
                            </Text>
                          </View>
                        </View>

                        {/* Device Type Right Icon */}
                        <View className="h-8 w-8 items-center justify-center rounded-lg bg-surface-container">
                          <DeviceIconComponent size={18} color="#00236f" />
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {/* Add Different Device Button */}
              <TouchableOpacity
                onPress={() => setRegisterSheetVisible(true)}
                className="min-h-[46px] flex-row items-center justify-center gap-2 rounded-xl bg-surface-container-low px-4 active:bg-surface-container"
                accessibilityLabel="Add a different device"
              >
                <PlusCircle size={18} color="#0051d5" />
                <Text className="text-xs font-bold text-secondary">
                  + Add a different device
                </Text>
              </TouchableOpacity>
            </View>

            {/* SECTION 2: PRIMARY PROBLEM */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-container">
                    <Text className="text-xs font-bold text-on-primary">2</Text>
                  </View>
                  <Text className="text-base font-bold text-on-surface">
                    Primary Problem *
                  </Text>
                </View>
                <Text className="text-xs font-medium text-on-surface-variant">
                  Core Fault
                </Text>
              </View>

              {/* Problem Input Field */}
              <Controller
                control={control}
                name="problem"
                rules={{
                  required: "Please describe the core issue",
                  minLength: {
                    value: 3,
                    message: "Problem must be at least 3 characters",
                  },
                  maxLength: {
                    value: 150,
                    message: "Problem must be 150 characters or fewer",
                  },
                }}
                render={({ field, fieldState }) => (
                  <View>
                    <View
                      className={`min-h-[52px] w-full flex-row items-center rounded-xl bg-surface-container-lowest px-3.5 shadow-sm border ${
                        fieldState.error
                          ? "border-error"
                          : "border-outline-variant/30"
                      }`}
                    >
                      <Wrench size={19} color="#0051d5" style={{ marginRight: 10 }} />
                      <TextInput
                        className="flex-1 py-3 text-sm text-on-surface"
                        placeholder="e.g., Laptop does not turn on"
                        placeholderTextColor="#757682"
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        maxLength={150}
                        accessibilityLabel="Primary problem input"
                      />
                      {field.value ? (
                        <TouchableOpacity
                          onPress={handleClearProblem}
                          accessibilityLabel="Clear problem input"
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          className="p-1 rounded-full active:bg-surface-container"
                        >
                          <X size={16} color="#757682" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    {fieldState.error ? (
                      <Text className="mt-1 text-xs text-error font-medium">
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />

              {/* Quick Select Common Issues Chips */}
              <View className="mt-1 gap-1.5">
                <Text className="text-xs font-semibold text-on-surface-variant">
                  Quick Select Common Issues
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {QUICK_ISSUES.map((chip) => {
                    const isChipActive = problemValue === chip.label;
                    const ChipIcon = chip.icon;

                    return (
                      <TouchableOpacity
                        key={chip.id}
                        onPress={() => handleChipPress(chip.label)}
                        className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 shadow-sm transition-transform active:scale-95 ${
                          isChipActive
                            ? "bg-secondary text-white"
                            : "bg-surface-container"
                        }`}
                        accessibilityLabel={`Quick select ${chip.label}`}
                      >
                        <ChipIcon
                          size={14}
                          color={isChipActive ? "#ffffff" : "#131b2e"}
                        />
                        <Text
                          className={`text-xs font-semibold ${
                            isChipActive ? "text-white" : "text-on-surface"
                          }`}
                        >
                          {chip.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* SECTION 3: DETAILED DESCRIPTION */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-primary-container">
                    <Text className="text-xs font-bold text-on-primary">3</Text>
                  </View>
                  <Text className="text-base font-bold text-on-surface">
                    Detailed Description *
                  </Text>
                </View>
                <Text className="text-xs font-bold text-secondary">
                  {descriptionValue.length}/500
                </Text>
              </View>

              <Controller
                control={control}
                name="description"
                rules={{
                  required: "Detailed description is required",
                  minLength: {
                    value: 10,
                    message: "Please write at least 10 characters",
                  },
                  maxLength: {
                    value: 500,
                    message: "Description must be 500 characters or fewer",
                  },
                }}
                render={({ field, fieldState }) => (
                  <View>
                    <View
                      className={`w-full rounded-xl bg-surface-container-lowest p-3.5 shadow-sm border ${
                        fieldState.error
                          ? "border-error"
                          : "border-outline-variant/30"
                      }`}
                    >
                      <TextInput
                        className="min-h-[105px] text-sm text-on-surface"
                        placeholder="Describe how the issue occurred, error codes shown, or unusual behaviors..."
                        placeholderTextColor="#757682"
                        multiline
                        textAlignVertical="top"
                        maxLength={500}
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        accessibilityLabel="Detailed description input"
                      />

                      <View className="mt-2.5 flex-row items-center justify-between border-t border-surface-container pt-2">
                        <View className="flex-row items-center gap-1">
                          <CheckCircle2 size={13} color="#0051d5" />
                          <Text className="text-[11px] font-medium text-on-surface-variant">
                            Helpful for bench diagnostics
                          </Text>
                        </View>
                        <Text className="text-[11px] text-outline">
                          Min. 10 chars
                        </Text>
                      </View>
                    </View>
                    {fieldState.error ? (
                      <Text className="mt-1 text-xs text-error font-medium">
                        {fieldState.error.message}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            </View>

            {/* DIAGNOSTIC PHOTOS (OPTIONAL) */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-on-surface">
                  Diagnostic Photos (Optional)
                </Text>
                <Text className="text-xs text-on-surface-variant">
                  {pickedImages.length}/5 photos
                </Text>
              </View>
              <Text className="text-xs text-on-surface-variant mb-1">
                Attach photos of visible damage or error messages for technicians.
              </Text>
              <ImagePickerGrid
                images={pickedImages}
                onAdd={pickImages}
                onRemove={removeImage}
                maxImages={5}
              />
            </View>

            {/* SECTION 4: DROP-OFF PREFERENCE NOTE */}
            <View className="flex-row items-start gap-3 rounded-xl bg-surface-container-high p-4 shadow-sm">
              <View className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest">
                <Store size={18} color="#0051d5" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-on-surface">
                  Drop-off Procedure
                </Text>
                <Text className="mt-1 text-xs leading-5 text-on-surface-variant">
                  You can bring this device to our repair center once the request
                  is{" "}
                  <Text className="font-bold text-primary">ACCEPTED</Text>. We
                  will allocate bench space and assign your diagnostic technician
                  immediately.
                </Text>
              </View>
            </View>

            {/* ERROR NOTIFICATION BANNER */}
            {error ? (
              <View className="rounded-xl bg-error/10 p-3.5 border border-error/20">
                <Text className="text-xs font-semibold text-error text-center">
                  Could not submit your repair request. Please check your network
                  connection and try again.
                </Text>
              </View>
            ) : null}
            </View>
          </View>
        </ScrollView>

        {/* FIXED BOTTOM ACTION BAR */}
        <View
          style={{
            paddingBottom: isKeyboardVisible
              ? Math.max(insets.bottom, 12)
              : navBarClearance,
          }}
          className="w-full border-t border-surface-container bg-surface/95 px-4 pt-3 backdrop-blur-md shadow-lg"
        >
          <View className="w-full max-w-md mx-auto items-center gap-1.5">
            <Pressable
              className={`min-h-[52px] w-full flex-row items-center justify-center gap-2 rounded-xl shadow-md ${
                isSubmitting || !selectedDeviceId
                  ? "bg-primary/60 opacity-70"
                  : "bg-primary active:opacity-95"
              }`}
              onPress={handleSubmit}
              disabled={isSubmitting || !selectedDeviceId}
              accessibilityLabel="Review and submit repair request"
              accessibilityRole="button"
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text className="text-sm font-bold text-on-primary">
                    Validating Request...
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-sm font-bold text-on-primary">
                    Review & Submit Request
                  </Text>
                  <ArrowRight size={18} color="#ffffff" />
                </>
              )}
            </Pressable>

            <View className="flex-row items-center gap-1.5 pt-0.5">
              <Clock size={13} color="#0051d5" />
              <Text className="text-xs text-on-surface-variant">
                Requests are typically reviewed within 2 hours.
              </Text>
            </View>
          </View>
        </View>

        {/* REGISTER DEVICE SHEET MODAL */}
        <RegisterDeviceSheet
          visible={isRegisterSheetVisible}
          onClose={() => setRegisterSheetVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
