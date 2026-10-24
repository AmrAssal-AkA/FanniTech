import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

interface FanniTechLogoProps {
  size?: number;
}

export const FanniTechLogo: React.FC<FanniTechLogoProps> = ({ size = 80 }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg viewBox="0 0 40 40" width={size} height={size}>
        <Rect x="4" y="4" width="32" height="32" rx="10" fill="#1E3A8A" />
        <Path d="M12 14h16v3.5H12zM12 21h10v3.5H12z" fill="#38BDF8" />
        <Circle cx="28" cy="25" r="3" fill="#10B981" />
        <Path d="M10 32h20c1.5 0 2.5-1 2.5-2H7.5c0 1 1 2 2.5 2z" fill="#64748B" />
      </Svg>
    </View>
  );
};

export default FanniTechLogo;
