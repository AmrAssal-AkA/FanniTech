import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight } from 'lucide-react-native';

interface LoginFormProps {
  onSubmit?: (data: { email: string; pass: string; remember: boolean }) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = () => {
    onSubmit?.({ email, pass: password, remember: rememberMe });
  };

  return (
    <View className="w-full rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-slate-100">
      {/* Email Field */}
      <View className="mb-4">
        <Text className="mb-1.5 text-xs font-semibold text-on-surface">
          Email Address
        </Text>
        <View className="relative flex-row items-center">
          <View className="absolute left-3.5 z-10">
            <Mail size={18} color="#757682" />
          </View>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="user@example.com"
            placeholderTextColor="#757682"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="h-[52px] w-full rounded-lg bg-surface-container-low pl-11 pr-4 text-sm text-on-surface focus:bg-surface-container-lowest focus:border-2 focus:border-secondary-container"
          />
        </View>
      </View>

      {/* Password Field */}
      <View className="mb-3">
        <Text className="mb-1.5 text-xs font-semibold text-on-surface">
          Password
        </Text>
        <View className="relative flex-row items-center">
          <View className="absolute left-3.5 z-10">
            <Lock size={18} color="#757682" />
          </View>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            placeholderTextColor="#757682"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            className="h-[52px] w-full rounded-lg bg-surface-container-low pl-11 pr-12 text-sm text-on-surface focus:bg-surface-container-lowest focus:border-2 focus:border-secondary-container"
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
      </View>

      {/* Remember Me & Forgot Password */}
      <View className="mb-5 flex-row items-center justify-between pt-1">
        <TouchableOpacity
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.7}
          className="flex-row items-center gap-2"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}
        >
          <View
            className={`h-5 w-5 items-center justify-center rounded border ${
              rememberMe
                ? 'bg-secondary border-secondary'
                : 'bg-surface-container-high border-slate-300'
            }`}
          >
            {rememberMe && <Check size={14} color="#ffffff" strokeWidth={3} />}
          </View>
          <Text className="text-xs text-on-surface">Remember me</Text>
        </TouchableOpacity>

      </View>

      {/* Sign In CTA */}
      <TouchableOpacity
        onPress={handleSubmit}
        activeOpacity={0.88}
        className="h-[52px] w-full flex-row items-center justify-center gap-2 rounded-lg bg-primary-container shadow-md active:scale-[0.98]"
        accessibilityRole="button"
        accessibilityLabel="Sign In"
      >
        <Text className="text-sm font-semibold text-on-primary">Sign In</Text>
        <ArrowRight size={18} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

export default LoginForm;
