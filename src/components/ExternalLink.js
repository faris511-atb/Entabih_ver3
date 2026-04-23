/**
 * src/components/ExternalLink.js
 * Converted from: components/ExternalLink.tsx
 *
 * Expo → CLI changes:
 *  - `expo-web-browser` (openBrowserAsync) → `Linking.openURL` from react-native
 *  - `expo-router` (Link) → `TouchableOpacity` from react-native
 *  - TSX → JS
 */

import { TouchableOpacity } from 'react-native';
import { Linking } from 'react-native';

export function ExternalLink({ href, children, style, ...rest }) {
  const handlePress = async () => {
    try {
      await Linking.openURL(href);
    } catch (e) {
      console.error('Failed to open URL:', e);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style} {...rest}>
      {children}
    </TouchableOpacity>
  );
}
