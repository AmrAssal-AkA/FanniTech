import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Wrench,
  CheckCircle,
  FileText,
  Thermometer,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  MapPin,
  ShieldCheck,
} from 'lucide-react-native';
import { AlertItem } from '../types';

interface AlertCardProps {
  alert: AlertItem;
  onPress: (alert: AlertItem) => void;
  onActionPress?: (alert: AlertItem) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onPress,
  onActionPress,
}) => {
  const renderIcon = () => {
    const iconColor = alert.isUnread ? '#0051d5' : '#444651';
    switch (alert.type) {
      case 'diagnostic':
        return <Wrench size={20} color={iconColor} strokeWidth={2} />;
      case 'status':
        return <CheckCircle size={20} color={iconColor} strokeWidth={2} />;
      case 'intake':
        return <FileText size={20} color={iconColor} strokeWidth={2} />;
      case 'thermal':
        return <Thermometer size={20} color={iconColor} strokeWidth={2} />;
      case 'security':
        return <ShieldAlert size={20} color={iconColor} strokeWidth={2} />;
      default:
        return <FileText size={20} color={iconColor} strokeWidth={2} />;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(alert)}
      className={`rounded-xl p-3.5 shadow-xs relative overflow-hidden ${
        alert.isUnread
          ? 'bg-surface-container-low border border-surface-container-high/40'
          : 'bg-surface-container-lowest border border-surface-container-high/20'
      }`}
      accessibilityRole="button"
      accessibilityLabel={`${alert.title}. ${alert.isUnread ? 'Unread' : 'Read'}`}
    >
      {/* Blue left edge bar for unread notifications */}
      {alert.isUnread && (
        <View className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-l" />
      )}

      <View className="flex-row items-start gap-3">
        {/* Category icon box */}
        <View
          className={`w-10 h-10 rounded-lg items-center justify-center flex-shrink-0 ${
            alert.isUnread
              ? 'bg-surface-container-highest'
              : 'bg-surface-container-high'
          }`}
        >
          {renderIcon()}
        </View>

        {/* Content details */}
        <View className="flex-1 min-w-0">
          {/* Top row: tags, reference ID, unread dot & timestamp */}
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1.5 flex-1 min-w-0">
              {alert.isUnread && (
                <View className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />
              )}
              <Text
                numberOfLines={1}
                className={`text-xs font-bold tracking-wider ${
                  alert.isUnread ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                {alert.referenceId}
              </Text>
              <View className="px-1.5 py-0.5 rounded bg-surface-container-highest">
                <Text className="text-[10px] font-semibold uppercase text-on-surface-variant">
                  {alert.tag}
                </Text>
              </View>
            </View>

            <Text className="text-[11px] text-outline flex-shrink-0">
              {alert.timeAgo}
            </Text>
          </View>

          {/* Title */}
          <Text
            className={`text-sm mt-1 leading-snug ${
              alert.isUnread
                ? 'font-bold text-on-surface tracking-tight'
                : 'font-semibold text-on-surface'
            }`}
          >
            {alert.title}
          </Text>

          {/* Description */}
          <Text
            numberOfLines={2}
            className="text-xs text-on-surface-variant mt-0.5 leading-relaxed"
          >
            {alert.description}
          </Text>

          {/* Optional Action / Metadata Footer */}
          {(alert.technician || alert.location || alert.action) && (
            <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-surface-container-high/60">
              {alert.technician && (
                <View className="flex-row items-center gap-1 flex-1">
                  <ShieldCheck size={14} color="#0051d5" />
                  <Text className="text-[11px] text-on-surface-variant font-medium">
                    {alert.technician}
                  </Text>
                </View>
              )}

              {alert.location && (
                <View className="flex-row items-center gap-1 flex-1">
                  <MapPin size={14} color="#757682" />
                  <Text
                    numberOfLines={1}
                    className="text-[11px] text-on-surface-variant font-medium flex-1"
                  >
                    {alert.location}
                  </Text>
                </View>
              )}

              {alert.action && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onActionPress?.(alert)}
                  className="flex-row items-center gap-1 ml-auto"
                  accessibilityRole="button"
                  accessibilityLabel={alert.action.label}
                >
                  <Text className="text-xs font-semibold text-primary">
                    {alert.action.label}
                  </Text>
                  {alert.action.type === 'ticket' ? (
                    <ArrowRight size={15} color="#00236f" />
                  ) : (
                    <ChevronRight size={15} color="#00236f" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
