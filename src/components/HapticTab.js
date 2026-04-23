/**
 * src/components/HapticTab.js
 * Converted from: components/HapticTab.tsx
 *
 * Expo → CLI changes:
 *  - `expo-haptics` → `react-native-haptic-feedback`
 *  - `process.env.EXPO_OS` → `Platform.OS`
 *  - `PlatformPressable` from @react-navigation/elements kept (CLI compatible)
 *  - TSX → JS
 *
 * Required: npm install react-native-haptic-feedback
 */

import { Platform } from 'react-native';
import { PlatformPressable } from '@react-navigation/elements';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export function HapticTab(props) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (Platform.OS === 'ios') {
          // Replaces: Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          ReactNativeHapticFeedback.trigger('impactLight', {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false,
          });
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
