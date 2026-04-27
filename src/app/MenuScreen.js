/**
 * src/screens/MenuScreen.js
 * Converted from: app/(public)/menu.tsx
 *
 * Expo → CLI changes:
 *  - `@expo/vector-icons` → `react-native-vector-icons`
 *  - `useRouter` / `useFocusEffect` (expo-router) → useNavigation + useFocusEffect (@react-navigation/native)
 *  - `@/app/context/AuthContext` → `../context/AuthContext`
 *  - `@/constants/ThemeContext` → `../constants/ThemeContext`
 *  - router.push('/userinfo') → navigation.navigate('userinfo')
 *  - router.push('/feedbacks') → navigation.navigate('feedbacks')
 *  - router.replace('/homescreen') → navigation.navigate('homescreen')
 *  - router.push('/_sitemap') → removed (expo-specific dev tool, replaced with no-op)
 *  - react-native-reanimated FadeInDown/FadeIn are kept (CLI compatible)
 *  - All UI/logic identical to original
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Image,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import { useTheme } from '../constants/ThemeContext';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ICON_COLOR = '#003D4D';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const auth = useAuth();
  const { theme, mode, toggleTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      return () => {};
    }, []),
  );

  const handleLogout = async () => {
    try {
      setLoading(true);
      if (auth?.signout) {
        await auth.signout();
        setShowLogoutConfirm(false);
        Alert.alert('نجاح', 'تم تسجيل الخروج بنجاح', [
          { text: 'حسناً', onPress: () => navigation.navigate('homescreen') },
        ]);
      } else {
        throw new Error('Auth context not ready');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'المعلومات الشخصية',
      icon: <Ionicons name="person" size={22} color="#FFF" />,
      onPress: () => navigation.navigate('userinfo'),
      showArrow: true,
    },
    {
      title: 'الوضع الليلي',
      icon: mode === 'dark'
        ? <Ionicons name="moon" size={22} color="#FFF" />
        : <Ionicons name="sunny" size={22} color="#FFF" />,
      component: (
        <Switch
          value={mode === 'dark'}
          onValueChange={toggleTheme}
          thumbColor={mode === 'dark' ? '#fff' : ICON_COLOR}
          trackColor={{ false: '#ccc', true: ICON_COLOR }}
          style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
        />
      ),
      showArrow: false,
    },
    {
      title: 'رأيك عن التطبيق',
      icon: <MaterialIcons name="rate-review" size={22} color="#FFF" />,
      onPress: () => navigation.navigate('feedbacks'),
      showArrow: true,
    },
    {
       title: 'الأسئلة الشائعة',
       icon: <Ionicons name="help-circle" size={22} color="#FFF" />,
       onPress: () => navigation.navigate('faq'),
       showArrow: true,
     },
    {
      title: 'تسجيل خروج',
      icon: <MaterialIcons name="logout" size={22} color="#FFF" />,
      onPress: () => setShowLogoutConfirm(true),
      showArrow: false,
      danger: true,
    },
  ];

  const userDisplayName = auth?.user?.username || 'المستخدم';

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={[styles.profileCard, { backgroundColor: theme.card }]}
        >
          <View style={styles.profileImageContainer}>
            {auth?.user?.profileImage ? (
              <Image
                source={{ uri: auth.user.profileImage }}
                style={styles.profileImage}
                accessibilityLabel="صورة الملف الشخصي"
              />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: ICON_COLOR }]}>
                <FontAwesome name="user" size={40} color="#FFF" />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.username, { color: theme.text }]}>{userDisplayName}</Text>
            <TouchableOpacity
              style={[styles.editProfileButton, { backgroundColor: `${ICON_COLOR}20` }]}
              onPress={() => navigation.navigate('userinfo')}
              accessibilityLabel="تعديل الملف"
            >
              <Text style={[styles.editProfileText, { color: ICON_COLOR }]}>تعديل الملف</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Menu Options */}
        <View style={styles.optionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary || theme.subtext }]}>
            الإعدادات
          </Text>

          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={[styles.optionsContainer, { backgroundColor: theme.card }]}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  index !== menuItems.length - 1 && [
                    styles.optionBorder,
                    { borderBottomColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
                  ],
                  item.danger && { backgroundColor: 'rgba(255, 59, 48, 0.08)' },
                ]}
                onPress={item.onPress}
                disabled={!item.onPress || (item.title === 'تسجيل خروج' && loading)}
                accessibilityLabel={item.title}
                accessibilityRole="button"
              >
                <View style={styles.optionLeft}>
                  {item.showArrow && (
                    <AntDesign name="left" size={16} color={theme.textSecondary || theme.subtext} />
                  )}
                  {item.component}
                </View>

                <View style={styles.optionCenter}>
                  <Text style={[
                    styles.optionText,
                    { color: item.danger ? '#FF3B30' : theme.text },
                  ]}>
                    {item.title}
                  </Text>
                </View>

                <View style={[
                  styles.iconContainer,
                  { backgroundColor: item.danger ? '#FF3B30' : ICON_COLOR },
                ]}>
                  {item.icon}
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.appInfo} />
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.modalOverlay}>
          <Animated.View
            entering={FadeInDown.springify().damping(15)}
            style={[styles.confirmDialog, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.confirmTitle, { color: theme.text }]}>تسجيل الخروج</Text>
            <Text style={[styles.confirmMessage, { color: theme.textSecondary || theme.subtext }]}>
              هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  styles.cancelButton,
                  { backgroundColor: mode === 'dark' ? '#333' : '#EEEEEE' },
                ]}
                onPress={() => setShowLogoutConfirm(false)}
                disabled={loading}
              >
                <Text style={[styles.cancelButtonText, { color: mode === 'dark' ? '#FFF' : '#333' }]}>
                  إلغاء
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, styles.logoutButton]}
                onPress={handleLogout}
                disabled={loading}
              >
                <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  scrollContent: { paddingBottom: 30, paddingTop: 20 },
  profileCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImageContainer: { marginRight: 16 },
  profileImage: { width: 80, height: 80, borderRadius: 40 },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1, justifyContent: 'center' },
  username: { fontSize: 20, fontWeight: '700', marginBottom: 4, textAlign: 'right' },
  editProfileButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  editProfileText: { fontSize: 14, fontWeight: '600' },
  optionsSection: { marginTop: 24, marginHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
    paddingRight: 4,
  },
  optionsContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  optionBorder: { borderBottomWidth: 1 },
  optionLeft: { flexDirection: 'row', alignItems: 'center', minWidth: 40, justifyContent: 'flex-start' },
  optionCenter: { flex: 1, alignItems: 'flex-end', marginHorizontal: 12 },
  optionText: { fontSize: 16, fontWeight: '500', textAlign: 'right' },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: { alignItems: 'center', marginTop: 30, marginBottom: 10 },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmDialog: {
    width: SCREEN_WIDTH - 64,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  confirmMessage: { fontSize: 16, textAlign: 'center', marginBottom: 24 },
  confirmButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: { backgroundColor: '#EEEEEE' },
  logoutButton: { backgroundColor: '#FF3B30' },
  cancelButtonText: { fontWeight: '600', fontSize: 16 },
  logoutButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
});

export default ProfileScreen;

const App = () => <ProfileScreen />;
export { App };
