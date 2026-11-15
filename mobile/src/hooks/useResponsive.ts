import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getScreenBreakpoint,
  RESPONSIVE_BASE,
  scaleFont,
  scaleSize,
  ScreenBreakpoint,
} from '../utils/responsive';

export interface ResponsiveMetrics {
  width: number;
  height: number;
  breakpoint: ScreenBreakpoint;
  isCompact: boolean;
  isLarge: boolean;
  isTablet: boolean;
  horizontalPaddingClass: string;
  contentContainerClass: string;
  headingTextClass: string;
  subheadingTextClass: string;
  bodyTextClass: string;
  captionTextClass: string;
  tabBarBottomPadding: number;
  screenBottomPadding: number;
  maxContentWidth: number;
  scaleSize: (size: number) => number;
  scaleFont: (size: number) => number;
}

export function useResponsive(): ResponsiveMetrics {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const breakpoint = getScreenBreakpoint(width);
    const isCompact = breakpoint === 'compact';
    const isLarge = breakpoint === 'large';
    const isTablet = breakpoint === 'tablet';

    const horizontalPaddingClass = isCompact
      ? 'px-3'
      : isTablet
        ? 'px-6'
        : isLarge
          ? 'px-5'
          : 'px-4';

    const contentContainerClass = isTablet
      ? 'w-full max-w-2xl self-center'
      : 'w-full';

    const headingTextClass = isCompact
      ? 'text-xl'
      : isTablet
        ? 'text-3xl'
        : 'text-2xl';

    const subheadingTextClass = isCompact
      ? 'text-base'
      : isTablet
        ? 'text-xl'
        : 'text-lg';

    const bodyTextClass = isCompact ? 'text-[13px]' : 'text-sm';
    const captionTextClass = isCompact ? 'text-[11px]' : 'text-xs';

    return {
      width,
      height,
      breakpoint,
      isCompact,
      isLarge,
      isTablet,
      horizontalPaddingClass,
      contentContainerClass,
      headingTextClass,
      subheadingTextClass,
      bodyTextClass,
      captionTextClass,
      tabBarBottomPadding: RESPONSIVE_BASE.tabBarClearance + insets.bottom,
      screenBottomPadding: Math.max(24, insets.bottom + 16),
      maxContentWidth: RESPONSIVE_BASE.maxContentWidth,
      scaleSize: (size: number) => scaleSize(size, width),
      scaleFont: (size: number) => scaleFont(size, width),
    };
  }, [width, height, insets.bottom]);
}
