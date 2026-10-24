import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ImagePickerAsset } from 'expo-image-picker';
import { Plus, X } from 'lucide-react-native';

interface ImagePickerGridProps {
  images: ImagePickerAsset[];
  onAdd: () => void;
  onRemove: (uri: string) => void;
  maxImages: number;
}

export const ImagePickerGrid: React.FC<ImagePickerGridProps> = ({ images, onAdd, onRemove, maxImages }) => (
  <View className="flex-row flex-wrap gap-3">
    {images.map((image) => (
      <View key={image.uri} className="relative h-20 w-20 overflow-hidden rounded-lg">
        <Image source={{ uri: image.uri }} className="h-full w-full" />
        <TouchableOpacity className="absolute right-1 top-1 rounded-full bg-black/60 p-1" onPress={() => onRemove(image.uri)} accessibilityLabel="Remove selected image">
          <X size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    ))}
    {images.length < maxImages ? (
      <TouchableOpacity className="h-20 w-20 items-center justify-center rounded-lg border border-dashed border-outline" onPress={onAdd} accessibilityLabel="Add repair image">
        <Plus size={22} color="#00236f" />
        <Text className="mt-1 text-[10px] text-primary">Add image</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);
