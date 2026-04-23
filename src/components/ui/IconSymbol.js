/**
 * src/components/ui/IconSymbol.js
 * Converted from: components/ui/IconSymbol.tsx
 *
 * Expo → CLI changes:
 *  - `expo-symbols` (SymbolWeight, SymbolViewProps) → removed
 *  - `@expo/vector-icons/MaterialIcons` → `react-native-vector-icons/MaterialIcons`
 *  - TSX → JS (removed all TypeScript types)
 *  - MAPPING table identical to original
 */

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import React from 'react';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
};

export function IconSymbol({ name, size = 24, color, style }) {
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={MAPPING[name]}
      style={style}
    />
  );
}
