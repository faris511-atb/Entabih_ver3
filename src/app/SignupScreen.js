/**
 * src/screens/SignupScreen.js
 * Converted from: app/signup.tsx
 *
 * Expo → CLI changes:
 *  - `useRouter` (expo-router) → `useNavigation` (@react-navigation/native)
 *  - `@/app/context/AuthContext` → `../context/AuthContext`
 *  - router.replace('/login') → navigation.replace('login')
 *  - router.push('/login')    → navigation.navigate('login')
 *  - All UI/logic identical to original
 */

import React, { useState, useEffect } from 'react';
import {
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';

const SignupScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { signup, session } = useAuth();

  // Monitor authentication state and redirect when logged in
  useEffect(() => {
    if (session) {
      navigation.replace('login');
    }
  }, [session, navigation]);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('تنبيه', 'يرجى تعبئة جميع الحقول.');
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert('تم التسجيل', 'تم إنشاء الحساب بنجاح!');
    } else if (result.message === 'duplicate') {
      Alert.alert('تنبيه', 'البريد الإلكتروني مستخدم بالفعل.');
    } else if (result.message === 'network') {
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم. تحقق من الشبكة.');
    } else {
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء الحساب.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>إنشاء حساب جديد</Text>

        <Text style={styles.label}>الاسم الكامل</Text>
        <TextInput
          placeholder="اسمك الكامل"
          value={name}
          onChangeText={setName}
          style={[styles.input, styles.arabicInput]}
        />

        <Text style={styles.label}>البريد الإلكتروني</Text>
        <TextInput
          placeholder="example@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, styles.arabicInput]}
        />

        <Text style={styles.label}>كلمة المرور</Text>
        <TextInput
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[styles.input, styles.arabicInput]}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0B4C5F" style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
            <Text style={styles.signupButtonText}>تسجيل</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('login')}
          style={styles.loginLink}
        >
          <Text style={styles.loginText}>لديك حساب؟ تسجيل الدخول</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
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
  arabicInput: {
    textAlign: 'right',
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

export default SignupScreen;
