/**
 * src/components/ThemedView.js
 * Converted from: components/ThemedView.tsx
 *
 * Changes:
 *  - TSX → JS (removed TypeScript types)
 *  - `@/hooks/useThemeColor` → `../hooks/useThemeColor`
 */

import { View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export function ThemedView({ style, lightColor, darkColor, ...otherProps }) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
