/**
 * src/screens/LoginScreen.js
 * Converted from: app/login.tsx
 *
 * Expo → CLI changes:
 *  - `useRouter` (expo-router) → `useNavigation` (@react-navigation/native)
 *  - `@/app/context/AuthContext` → `../context/AuthContext`
 *  - router.push('/homescreen') → navigation.navigate('(public)')
 *  - router.push('/signup')     → navigation.navigate('signup')
 *  - All UI/logic identical to original
 */

import React, { useState } from 'react';
import {
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  I18nManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';

// تأكد من أن النصوص تُعرض من اليمين
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      Alert.alert('تم تسجيل الدخول', 'أهلاً فيك!');
      navigation.replace('(public)');
    } else {
      Alert.alert('فشل تسجيل الدخول', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('(public)')}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>{'>'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>تسجيل الدخول</Text>

      <Text style={styles.label}>البريد الإلكتروني:</Text>
      <TextInput
        placeholder="أدخل بريدك الإلكتروني"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={[styles.input, { textAlign: 'right' }]}
      />

      <Text style={styles.label}>كلمة المرور:</Text>
      <TextInput
        placeholder="أدخل كلمة المرور"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, { textAlign: 'right' }]}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0B4C5F" style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity style={styles.signupButton} onPress={handleLogin}>
          <Text style={styles.signupButtonText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('signup')}
        style={styles.loginLink}
      >
        <Text style={styles.loginText}>ليس لديك حساب؟ سجل الآن</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    right: 10,
    padding: 10,
  },
  backButtonText: {
    fontSize: 40,
    color: '#0B4C5F',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#0B4C5F',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  signupButton: {
    backgroundColor: '#0B4C5F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  loginText: {
    color: '#0B4C5F',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
