/**
 * src/components/ui/TabBarBackground.js
 * Converted from: components/ui/TabBarBackground.tsx
 *
 * This is a shim for Android and web where the tab bar is generally opaque.
 * In CLI projects there is no BlurView tab bar on iOS by default —
 * the tab bar background is handled directly in AppNavigator tabBarStyle.
 *
 * useBottomTabOverflow is used by ParallaxScrollView to account for
 * the tab bar height. Returning 0 is correct for standard setups.
 */

export default undefined;

export function useBottomTabOverflow() {
  return 0;
}
