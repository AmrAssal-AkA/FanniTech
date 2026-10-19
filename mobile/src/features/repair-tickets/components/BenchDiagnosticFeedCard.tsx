import React from 'react';
import { View, Text, Image } from 'react-native';
import { DiagnosticFeedItem } from '../types';

interface BenchDiagnosticFeedCardProps {
  feed?: DiagnosticFeedItem;
}

export const BenchDiagnosticFeedCard: React.FC<BenchDiagnosticFeedCardProps> = ({
  feed,
}) => {
  if (!feed?.imageUrl) return null;

  return (
    <View className="mx-4 my-2">
      <View className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-container/80">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2.5">
          <Text className="text-base font-bold text-primary">
            Bench Diagnostic Feed
          </Text>
          <View className="flex-row items-center gap-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
            <Text className="text-[11px] font-semibold text-on-surface-variant">
              Captured by Tech
            </Text>
          </View>
        </View>

        {/* Photo Container */}
        <View className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container-highest">
          <Image
            source={{ uri: feed.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />

          {/* Overlay Info Strip */}
          <View className="absolute bottom-0 left-0 right-0 bg-primary/80 px-3 py-2 flex-row items-center justify-between">
            <Text
              className="text-xs font-semibold text-on-primary flex-1 mr-2"
              numberOfLines={1}
            >
              {feed.caption}
            </Text>
            <View className="bg-primary px-2 py-0.5 rounded">
              <Text className="text-[10px] font-bold text-on-primary font-mono">
                {feed.badge}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

