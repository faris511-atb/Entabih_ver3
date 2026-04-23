/**
 * src/hooks/useThemeColor.js
 * Converted from: hooks/useThemeColor.ts
 *
 * Changes:
 *  - TS → JS (removed TypeScript generics/types)
 *  - `@/constants/Colors` → `../constants/Colors`
 *  - `@/hooks/useColorScheme` → `./useColorScheme`
 */

import { Colors } from '../constants/Colors';
import { useColorScheme } from './useColorScheme';

export function useThemeColor(props, colorName) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
