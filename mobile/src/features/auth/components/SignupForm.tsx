import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import {
  User,
  Mail,
  Phone,
  Lock,
  LockKeyhole,
  Eye,
  EyeOff,
  Check,
  CheckCircle,
  Circle,
  ArrowRight,
} from 'lucide-react-native';

interface SignupFormProps {
  onSubmit?: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    agreedToTerms: boolean;
  }) => void;
  onPressTerms?: () => void;
  onPressPrivacy?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  onPressTerms,
  onPressPrivacy,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Security live requirement calculations
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);

  let strengthScore = 0;
  if (hasMinLength) strengthScore += 1;
  if (hasNumber) strengthScore += 1;

  const strengthLabel =
    strengthScore === 0 ? 'Unfulfilled' : strengthScore === 1 ? 'Moderate' : 'Ready';

  const strengthBarWidth =
    strengthScore === 0 ? 'w-0' : strengthScore === 1 ? 'w-1/2' : 'w-full';

  const handleSubmit = () => {
    onSubmit?.({
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      agreedToTerms,
    });
  };

  return (
    <View className="w-full flex-col gap-4">
      {/* Full Name Field */}
      <View>
        <View className="mb-1.5 flex-row items-center gap-1">
          <Text className="text-xs font-semibold text-on-surface-variant">Full Name</Text>
          <Text className="text-xs text-red-600">*</Text>
        </View>
        <View className="relative flex-row items-center">
          <View className="absolute left-3.5 z-10">
            <User size={18} color="#757682" />
          </View>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Sarah Ahmed"
            placeholderTextColor="#757682"
            className="h-[52px] w-full rounded-lg bg-surface-container-lowest pl-11 pr-4 text-sm text-on-surface shadow-sm border border-slate-100"
          />
        </View>
      </View>

      {/* Email Address Field */}
      <View>
        <View className="mb-1.5 flex-row items-center gap-1">
          <Text className="text-xs font-semibold text-on-surface-variant">Email Address</Text>
          <Text className="text-xs text-red-600">*</Text>
        </View>
        <View className="relative flex-row items-center">
          <View className="absolute left-3.5 z-10">
            <Mail size={18} color="#757682" />
          </View>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="user@domain.com"
            placeholderTextColor="#757682"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="h-[52px] w-full rounded-lg bg-surface-container-lowest pl-11 pr-4 text-sm text-on-surface shadow-sm border border-slate-100"
          />
        </View>
      </View>

      {/* Phone Number Field */}
      <View>
        <View className="mb-1.5 flex-row items-center gap-1">
          <Text className="text-xs font-semibold text-on-surface-variant">Phone Number</Text>
          <Text className="text-xs text-red-600">*</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {/* Dial code pill */}
          <View className="h-[52px] flex-row items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3 shadow-sm border border-slate-100">
            <Text className="text-sm">EG</Text>
            <Text className="text-xs font-bold text-on-surface">+20</Text>
          </View>
          {/* Number input */}
          <View className="relative flex-1 flex-row items-center">
            <View className="absolute left-3.5 z-10">
              <Phone size={18} color="#757682" />
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="123 456 7890"
              placeholderTextColor="#757682"
              keyboardType="phone-pad"
              className="h-[52px] w-full rounded-lg bg-surface-container-lowest pl-11 pr-4 text-sm text-on-surface shadow-sm border border-slate-100"
            />
          </View>
        </View>
      </View>

      {/* Password Field with Security Requirements */}
      <View>
        <View className="mb-1.5 flex-row items-center gap-1">
          <Text className="text-xs font-semibold text-on-surface-variant">Password</Text>
          <Text className="text-xs text-red-600">*</Text>
        </View>
        <View className="relative flex-row items-center">
          <View className="absolute left-3.5 z-10">
            <Lock size={18} color="#757682" />
          </View>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter secure password"
            placeholderTextColor="#757682"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            className="h-[52px] w-full rounded-lg bg-surface-container-lowest pl-11 pr-12 text-sm text-on-surface shadow-sm border border-slate-100"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            className="absolute right-1 h-11 w-11 items-center justify-center rounded-lg"
            accessibilityRole="button"
            accessibilityLabel="Toggle password visibility"
          >
            {showPassword ? (
              <EyeOff size={18} color="#757682" />
            ) : (
              <Eye size={18} color="#757682" />
            )}
          </TouchableOpacity>
        </View>

        {/* Live Password Strength Meter */}
        <View className="mt-2 rounded-lg bg-surface-container-low p-3 shadow-sm border border-slate-100">
          <View className="flex-row items-center justify-between pb-1.5">
            <Text className="text-[11px] font-semibold text-on-surface-variant">
              Security Requirements
            </Text>
            <Text
              className={`text-[11px] font-bold ${
                strengthScore === 2
                  ? 'text-secondary'
                  : strengthScore === 1
                  ? 'text-secondary-container'
                  : 'text-outline'
              }`}
            >
              {strengthLabel}
            </Text>
          </View>

          {/* Progress bar */}
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
            <View className={`h-full ${strengthBarWidth} rounded-full bg-secondary`} />
          </View>

          {/* Checklist */}
          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              {hasMinLength ? (
                <CheckCircle size={13} color="#0051d5" />
              ) : (
                <Circle size={13} color="#757682" />
              )}
              <Text
                className={`text-[11px] ${
                  hasMinLength ? 'font-semibold text-secondary' : 'text-outline'
                }`}
              >
                8+ characters
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              {hasNumber ? (
                <CheckCircle size={13} color="#0051d5" />
              ) : (
                <Circle size={13} color="#757682" />
              )}
              <Text
                className={`text-[11px] ${
                  hasNumber ? 'font-semibold text-secondary' : 'text-outline'
                }`}
              >
                At least 1 number
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Confirm Password Field */}
      <View>
        <View className="mb-1.5 flex-row items-center gap-1">
          <Text className="text-xs font-semibold text-on-surface-variant">Confirm Password</Text>
          <Text className="text-xs text-red-600">*</Text>
        </View>
        <View className="relative flex-row items-center">
          <View className="absolute left-3.5 z-10">
            <LockKeyhole size={18} color="#757682" />
          </View>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat password"
            placeholderTextColor="#757682"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            className="h-[52px] w-full rounded-lg bg-surface-container-lowest pl-11 pr-12 text-sm text-on-surface shadow-sm border border-slate-100"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            activeOpacity={0.7}
            className="absolute right-1 h-11 w-11 items-center justify-center rounded-lg"
            accessibilityRole="button"
            accessibilityLabel="Toggle confirm password visibility"
          >
            {showConfirmPassword ? (
              <EyeOff size={18} color="#757682" />
            ) : (
              <Eye size={18} color="#757682" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Agreement Checkbox */}
      <TouchableOpacity
        onPress={() => setAgreedToTerms(!agreedToTerms)}
        activeOpacity={0.7}
        className="mt-1 flex-row items-start gap-2.5"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreedToTerms }}
      >
        <View
          className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
            agreedToTerms
              ? 'bg-secondary border-secondary'
              : 'bg-surface-container-lowest border-slate-300'
          }`}
        >
          {agreedToTerms && <Check size={14} color="#ffffff" strokeWidth={3} />}
        </View>
        <Text className="flex-1 text-xs leading-5 text-on-surface-variant">
          I agree to the{' '}
          <Text
            onPress={onPressTerms}
            className="font-semibold text-secondary"
          >
            FanniTech Service Terms
          </Text>{' '}
          and{' '}
          <Text
            onPress={onPressPrivacy}
            className="font-semibold text-secondary"
          >
            Repair Privacy Policy
          </Text>
        </Text>
      </TouchableOpacity>

      {/* Create Account CTA */}
      <TouchableOpacity
        onPress={handleSubmit}
        activeOpacity={0.88}
        className="mt-2 h-12 w-full flex-row items-center justify-center gap-2 rounded-lg bg-primary-container shadow-md active:scale-[0.98]"
        accessibilityRole="button"
        accessibilityLabel="Create Account"
      >
        <Text className="text-sm font-semibold text-on-primary">Create Account</Text>
        <ArrowRight size={18} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

export default SignupForm;
