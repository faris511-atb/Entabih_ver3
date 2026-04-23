/**
 * src/components/ParallaxScrollView.js
 * Converted from: components/ParallaxScrollView.tsx
 *
 * Changes:
 *  - TSX → JS
 *  - `@/components/*` → relative paths
 *  - `@/hooks/useColorScheme` → `../hooks/useColorScheme`
 *  - `useBottomTabOverflow` from TabBarBackground → inlined (returns 0)
 *  - react-native-reanimated kept (CLI compatible)
 */

import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { ThemedView } from './ThemedView';
import { useColorScheme } from '../hooks/useColorScheme';

const HEADER_HEIGHT = 250;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef();
  const scrollOffset = useScrollViewOffset(scrollRef);
  // Replaces useBottomTabOverflow() — returns 0 on Android/web
  const bottom = 0;

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: HEADER_HEIGHT, overflow: 'hidden' },
  content: { flex: 1, padding: 32, gap: 16, overflow: 'hidden' },
});
