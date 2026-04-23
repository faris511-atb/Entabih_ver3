/**
 * AppNavigator.js
 * Replaces expo-router (file-based routing) with React Navigation.
 *
 * Route mapping from expo-router → React Navigation:
 *   /                      → Welcome (SplashScreen)
 *   /(public)/homescreen   → HomeScreen
 *   /(public)/detector     → DetectorScreen
 *   /(public)/menu         → MenuScreen
 *   /(public)/reports      → ReportsScreen
 *   /(praviate)/add_report → AddReportScreen
 *   /login                 → LoginScreen
 *   /signup                → SignupScreen
 *   /userinfo              → UserInfoScreen
 *   /feedbacks             → FeedbacksScreen
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';

// Screens
import WelcomeScreen from '../app/WelcomeScreen';
import LoginScreen from '../app/LoginScreen';
import SignupScreen from '../app/SignupScreen';
import UserInfoScreen from '../app/UserInfoScreen';
import FeedbacksScreen from '../app/FeedbacksScreen';
import AddReportScreen from '../app/AddReportScreen';

// Tab Screens
import HomeScreen from '../app/HomeScreen';
import DetectorScreen from '../app/DetectorScreen';
import MenuScreen from '../app/MenuScreen';
import ReportsScreen from '../app/ReportsScreen';

// Context
import { ThemeProvider, useTheme } from '../constants/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Tab Bar Icon ────────────────────────────────────────────────────────────
const TabBarIcon = ({ source, focused, width = 24, height = 24, style = {} }) => (
  <Image
    source={source}
    style={[
      {
        tintColor: focused ? '#E5BB30' : 'white',
        width,
        height,
      },
      style,
    ]}
    resizeMode="contain"
  />
);

// ─── Bottom Tab Navigator ─────────────────────────────────────────────────────
function PublicTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.primary,
          borderTopColor: '#ccc',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 5,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#E5BB30',
        tabBarInactiveTintColor: 'white',
        headerStyle: { backgroundColor: theme.primary },
        headerTitleStyle: {
          textAlign: 'right',
          color: 'white',
          fontWeight: 'bold',
          fontSize: 20,
          fontFamily: 'Changa-SemiBold',
        },
        headerTintColor: 'white',
        tabBarLabelStyle: { marginBottom: 5 },
      }}
    >
      {/* الرئيسية */}
      <Tab.Screen
        name="homescreen"
        component={HomeScreen}
        options={{
          title: 'خلك نبيه',
          tabBarLabel: 'الرئيسية',
          tabBarLabelStyle: styles.BottomTitle,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              source={require('../assets/images/icons/home-svgrepo-com.png')}
            />
          ),
        }}
      />

      {/* الكاشف */}
      <Tab.Screen
        name="detector"
        component={DetectorScreen}
        options={{
          title: 'الكاشف',
          tabBarLabel: 'الكاشف',
          tabBarLabelStyle: styles.BottomTitle,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              source={require('../assets/images/icons/bandit-svgrepo-com.png')}
              width={30}
              height={30}
            />
          ),
        }}
      />

      {/* البلاغات */}
      <Tab.Screen
        name="reports"
        component={ReportsScreen}
        options={{
          title: 'البلاغات',
          tabBarLabel: 'البلاغات',
          tabBarLabelStyle: styles.BottomTitle,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              source={require('../assets/images/icons/loudspeaker-4-svgrepo-com.png')}
              width={31}
              height={31}
              style={{ marginLeft: 8 }}
            />
          ),
        }}
      />

      {/* القائمة */}
      <Tab.Screen
        name="menu"
        component={MenuScreen}
        options={{
          title: 'القائمة',
          tabBarLabel: 'القائمة',
          tabBarLabelStyle: styles.BottomTitle,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              source={require('../assets/images/icons/list-dashes-duotone-svgrepo-com.png')}
              width={30}
              height={30}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Stack Navigator ─────────────────────────────────────────────────────
function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Splash / Welcome */}
      <Stack.Screen name="index" component={WelcomeScreen} />

      {/* Public Tab group */}
      <Stack.Screen name="(public)" component={PublicTabs} />

      {/* Auth screens */}
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="signup" component={SignupScreen} />

      {/* Profile / Info */}
      <Stack.Screen name="userinfo" component={UserInfoScreen} />
      <Stack.Screen name="feedbacks" component={FeedbacksScreen} />

      {/* Private screens */}
      <Stack.Screen name="add_report" component={AddReportScreen} />
    </Stack.Navigator>
  );
}

// ─── App Navigator (exported) ─────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  BottomTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Changa-SemiBold',
  },
});
