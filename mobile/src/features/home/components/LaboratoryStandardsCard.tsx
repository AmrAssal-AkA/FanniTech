import React from 'react';
import { View, Text } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

export const LaboratoryStandardsCard: React.FC = () => {
  return (
    <View className="flex-row items-center gap-3 p-3.5 bg-surface-container-low rounded-2xl border border-slate-100 shadow-xs">
      <View className="w-10 h-10 rounded-xl bg-surface-container-high items-center justify-center shrink-0">
        <ShieldCheck size={22} color="#0051d5" strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text className="text-xs font-bold text-on-surface">
          Laboratory Rigor Standards
        </Text>
        <Text className="text-[11px] text-on-surface-variant leading-4 mt-0.5">
          All diagnostics follow OEM electrical & thermographic testing specs.
        </Text>
      </View>
    </View>
  );
};
