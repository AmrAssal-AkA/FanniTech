import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Save } from 'lucide-react-native';
import { EditProfileInput } from '../types';

interface EditProfileSheetProps {
  visible: boolean;
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  onSave: (input: EditProfileInput) => void;
  onClose: () => void;
}

export const EditProfileSheet: React.FC<EditProfileSheetProps> = ({
  visible,
  initialName,
  initialEmail,
  initialPhone,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  };

  // Reset fields when opened with fresh initialValues
  React.useEffect(() => {
    if (visible) {
      setName(initialName);
      setEmail(initialEmail);
      setPhone(initialPhone);
    }
  }, [visible, initialName, initialEmail, initialPhone]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-on-surface/40"
      >
        <View className="bg-surface-container-lowest rounded-t-2xl max-h-[92%]">
          {/* Drag handle */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-outline-variant" />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12 }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-on-surface text-lg font-bold">
                Edit Information
              </Text>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                className="w-9 h-9 rounded-full bg-surface-container items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={18} color="#444651" />
              </TouchableOpacity>
            </View>

            {/* Full Name */}
            <View className="gap-1.5 mb-4">
              <Text className="text-outline text-xs font-semibold uppercase tracking-wider">
                Full Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor="#757682"
                returnKeyType="next"
                className="h-[52px] px-3 rounded-lg bg-surface-container-low text-on-surface text-sm"
                accessibilityLabel="Full name input"
              />
            </View>

            {/* Phone */}
            <View className="gap-1.5 mb-4">
              <Text className="text-outline text-xs font-semibold uppercase tracking-wider">
                Phone Number
              </Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+966 50 000 0000"
                placeholderTextColor="#757682"
                keyboardType="phone-pad"
                returnKeyType="next"
                className="h-[52px] px-3 rounded-lg bg-surface-container-low text-on-surface text-sm"
                accessibilityLabel="Phone number input"
              />
            </View>

            {/* Email */}
            <View className="gap-1.5 mb-6">
              <Text className="text-outline text-xs font-semibold uppercase tracking-wider">
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="email@domain.com"
                placeholderTextColor="#757682"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                className="h-[52px] px-3 rounded-lg bg-surface-container-low text-on-surface text-sm"
                accessibilityLabel="Email address input"
              />
            </View>

            {/* Actions */}
            <View className="gap-2">
              <TouchableOpacity
                onPress={handleSave}
                activeOpacity={0.8}
                className="w-full min-h-[52px] bg-primary rounded-xl flex-row items-center justify-center gap-2 shadow-sm"
                accessibilityRole="button"
                accessibilityLabel="Save profile changes"
              >
                <Save size={18} color="#ffffff" />
                <Text className="text-on-primary text-sm font-bold">
                  Save Changes
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.8}
                className="w-full min-h-[52px] bg-surface-container rounded-xl items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel="Dismiss"
              >
                <Text className="text-on-surface text-sm font-semibold">
                  Dismiss
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

