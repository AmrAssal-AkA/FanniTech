import { PixelRatio } from 'react-native';

export const RESPONSIVE_BASE = {
  width: 390,
  height: 844,
  compactBreakpoint: 375,
  largeBreakpoint: 414,
  tabletBreakpoint: 768,
  minFontScale: 0.9,
  maxFontScale: 1.15,
  minSizeScale: 0.88,
  maxSizeScale: 1.2,
  tabBarClearance: 96,
  maxContentWidth: 640,
} as const;

export type ScreenBreakpoint = 'compact' | 'regular' | 'large' | 'tablet';

export function getScreenBreakpoint(width: number): ScreenBreakpoint {
  if (width >= RESPONSIVE_BASE.tabletBreakpoint) return 'tablet';
  if (width >= RESPONSIVE_BASE.largeBreakpoint) return 'large';
  if (width < RESPONSIVE_BASE.compactBreakpoint) return 'compact';
  return 'regular';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function scaleSize(size: number, screenWidth: number): number {
  const ratio = clamp(
    screenWidth / RESPONSIVE_BASE.width,
    RESPONSIVE_BASE.minSizeScale,
    RESPONSIVE_BASE.maxSizeScale,
  );
  return PixelRatio.roundToNearestPixel(size * ratio);
}

export function scaleFont(size: number, screenWidth: number): number {
  const ratio = clamp(
    screenWidth / RESPONSIVE_BASE.width,
    RESPONSIVE_BASE.minFontScale,
    RESPONSIVE_BASE.maxFontScale,
  );
  return PixelRatio.roundToNearestPixel(size * ratio);
}
