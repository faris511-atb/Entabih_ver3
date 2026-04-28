
//new update

/**
 * src/app/UserInfoScreen.js
 *
 * Fixed:
 *  - Theme fully integrated (useTheme)
 *  - Data loaded from AsyncStorage (real user data, not hardcoded)
 *  - Editable fields: name, password, phone (optional)
 *  - Save button updates the backend database
 *  - Password change requires current password confirmation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../constants/ThemeContext';
import { useAuth } from '../app/AuthContext';
const ENV = require('../config').default;

export default function UserInfoScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();


  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);

  // ── Load user data from storage on mount ─────────────────────────────────
 useEffect(() => {
  const loadUserData = async () => {
    setLoading(true);
    try {
      const storedName  = await AsyncStorage.getItem('username');
      const storedEmail = await AsyncStorage.getItem('user_email');
      const storedPhone = await AsyncStorage.getItem('user_phone');
      // Also use auth user if available
      if (user?.username) setName(user.username);
      else if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedPhone) setPhone(storedPhone);
    } catch (e) {
      console.error('Failed to load user data:', e);
    } finally {
      setLoading(false);
    }
  };
  loadUserData();
}, []);

  // ── Save changes ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('تنبيه', 'الاسم لا يمكن أن يكون فارغاً.');
      return;
    }

    if (newPassword && !currentPassword) {
      Alert.alert('تنبيه', 'يرجى إدخال كلمة المرور الحالية لتغييرها.');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      Alert.alert('تنبيه', 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.');
      return;
    }

    setSaving(true);
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token  = await AsyncStorage.getItem('token');

      const payload = {
        name:         name.trim(),
        phone:        phone.trim() || null,
      };

      if (newPassword && currentPassword) {
        payload.current_password = currentPassword;
        payload.new_password     = newPassword;
      }

      const response = await fetch(`${ENV.FASTAPI_URL}/update-user/${userId}`, {
        method:  'PUT',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
  // Update AsyncStorage
  await AsyncStorage.setItem('username', name.trim());
  if (phone.trim()) await AsyncStorage.setItem('user_phone', phone.trim());

  // Update AuthContext state so name updates immediately everywhere
  await updateUser(name.trim());

  setCurrentPassword('');
  setNewPassword('');
  Alert.alert('تم', 'تم حفظ التغييرات بنجاح.');
}

    } catch (e) {
      console.error('Save error:', e);
      Alert.alert('خطأ', 'تعذر الاتصال بالخادم.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar backgroundColor="#003D4D" barStyle="light-content" />

      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'< '}القائمة</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: '#D6A21E' }]}>المعلومات الشخصية</Text>

        <View style={[styles.card, { backgroundColor: theme.card }]}>

          {/* Name */}
          <Text style={[styles.label, { color: theme.text }]}>الاسم</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border || '#ccc', backgroundColor: theme.bg }]}
            value={name}
            onChangeText={setName}
            placeholder="أدخل اسمك"
            placeholderTextColor={theme.subtext}
            textAlign="right"
          />

          {/* Email — read only */}
          <Text style={[styles.label, { color: theme.text }]}>البريد الإلكتروني</Text>
          <View style={[styles.inputReadOnly, { borderColor: theme.border || '#ccc', backgroundColor: theme.dark ? '#1a1a1a' : '#f0f0f0' }]}>
            <Text style={[styles.readOnlyText, { color: theme.subtext }]}>{email || 'غير محدد'}</Text>
          </View>
          <Text style={[styles.hint, { color: theme.subtext }]}>البريد الإلكتروني لا يمكن تغييره</Text>

          {/* Phone */}
          <Text style={[styles.label, { color: theme.text }]}>رقم الجوال (اختياري)</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border || '#ccc', backgroundColor: theme.bg }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="05xxxxxxxx"
            placeholderTextColor={theme.subtext}
            keyboardType="phone-pad"
            textAlign="right"
          />

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.border || '#E0E0E0' }]} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>تغيير كلمة المرور</Text>
          <Text style={[styles.hint, { color: theme.subtext }]}>اتركها فارغة إن لم ترد التغيير</Text>

          {/* Current password */}
          <Text style={[styles.label, { color: theme.text }]}>كلمة المرور الحالية</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border || '#ccc', backgroundColor: theme.bg }]}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.subtext}
            secureTextEntry
            textAlign="right"
          />

          {/* New password */}
          <Text style={[styles.label, { color: theme.text }]}>كلمة المرور الجديدة</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border || '#ccc', backgroundColor: theme.bg }]}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.subtext}
            secureTextEntry
            textAlign="right"
          />
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[styles.saveButton, { opacity: saving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>حفظ التغييرات</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: {
    backgroundColor: '#003D4D',
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backButton:  { flexDirection: 'row' },
  backText:    { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Changa-SemiBold' },
  scroll:      { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 22, fontWeight: 'bold', alignSelf: 'center',
    marginBottom: 20, fontFamily: 'Changa-SemiBold',
  },
  card: {
    borderRadius: 16, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'right', marginBottom: 4, fontFamily: 'Changa-SemiBold' },
  label:        { fontSize: 14, marginBottom: 6, textAlign: 'right' },
  hint:         { fontSize: 12, textAlign: 'right', marginBottom: 12, opacity: 0.6 },
  input: {
    borderWidth: 1, borderRadius: 10, padding: 12,
    fontSize: 15, marginBottom: 16,
  },
  inputReadOnly: {
    borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 4,
  },
  readOnlyText:  { fontSize: 15, textAlign: 'right' },
  divider:       { height: 1, marginVertical: 16, opacity: 0.4 },
  saveButton: {
    backgroundColor: '#003D4D', padding: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 20,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'Changa-SemiBold' },
});
