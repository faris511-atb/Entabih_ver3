/**
 * src/screens/AddReportScreen.js
 * Converted from: app/(praviate)/add_report.tsx
 *
 * Expo → CLI changes:
 *  - `router` (expo-router) → `useNavigation` (@react-navigation/native)
 *  - `useFonts` (expo-font) → removed (fonts auto-linked)
 *  - `../../constants/ThemeContext` → `../constants/ThemeContext`
 *  - router.replace('/login')   → navigation.replace('login')
 *  - router.replace('/reports') → navigation.navigate('reports') [tab]
 *  - All UI/logic identical to original
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ENV from '../config';
import { useTheme } from '../constants/ThemeContext';

const MAIN_TYPES = {
  TEXT: 'رسالة نصية',
  PHONE: 'رقم هاتف',
};

const TEXT_SUBTYPES = {
  EMAIL: 'بريد إلكتروني',
  SCAMMER: 'تواصل اجتماعي',
};

export default function ReportScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [mainType, setMainType] = useState('');
  const [subType, setSubType] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [scammerText, setScammerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user_id');
      if (!token || !userId) {
        Alert.alert('تنبيه', 'يجب تسجيل الدخول أولاً.');
        navigation.replace('login');
      }
    };
    checkLogin();
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!title || title.trim().length < 12) errors.title = 'يرجى إدخال عنوان مناسب';
    if (!mainType) errors.mainType = 'يرجى اختيار نوع الإدخال';
    if (!description || description.trim().length < 30) errors.description = 'يرجى إدخال وصف مفصل';

    if (mainType === MAIN_TYPES.PHONE) {
      if (!phoneNumber) {
        errors.phoneNumber = 'يرجى إدخال رقم الهاتف';
      } else if (phoneNumber.length > 15) {
        errors.phoneNumber = 'يجب ألا يتجاوز رقم الهاتف 15 رقماً';
      }
    }

    if (mainType === MAIN_TYPES.TEXT) {
      if (!subType) {
        errors.subType = 'يرجى اختيار نوع الرسالة';
      } else if (subType === TEXT_SUBTYPES.EMAIL) {
        if (!email) {
          errors.email = 'يرجى إدخال البريد الإلكتروني';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          errors.email = 'يرجى إدخال بريد إلكتروني صحيح';
        }
      } else if (subType === TEXT_SUBTYPES.SCAMMER) {
        if (!scammerText || scammerText.length < 15) {
          errors.scammerText = 'يرجى إدخال محتوى الرسالة الاحتيالية';
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, mainType, subType, description, phoneNumber, email, scammerText]);

  const resetForm = useCallback(() => {
    setTitle('');
    setMainType('');
    setSubType('');
    setDescription('');
    setPhoneNumber('');
    setEmail('');
    setScammerText('');
    setValidationErrors({});
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const userIdString = await AsyncStorage.getItem('user_id');
      const user_id = userIdString ? parseInt(userIdString) : null;

      if (!user_id) {
        Alert.alert('خطأ', 'تعذر تحديد المستخدم. يرجى تسجيل الدخول من جديد.');
        setIsSubmitting(false);
        return;
      }

      const aiRes = await fetch(`${ENV.FASTAPI_URL}/moderate-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          phone_number: mainType === MAIN_TYPES.PHONE ? phoneNumber : '',
          email: mainType === MAIN_TYPES.TEXT && subType === TEXT_SUBTYPES.EMAIL ? email : '',
        }),
      });

      const aiData = await aiRes.json();

      if (aiData.classification !== 'جيد') {
        Alert.alert('بلاغ غير مقبول', 'تم رفض البلاغ لأنه غير جاد أو غير موثوق.');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        title,
        description,
        phone_number: mainType === MAIN_TYPES.PHONE ? phoneNumber : null,
        email: mainType === MAIN_TYPES.TEXT && subType === TEXT_SUBTYPES.EMAIL ? email : null,
        scammer_text: mainType === MAIN_TYPES.TEXT && subType === TEXT_SUBTYPES.SCAMMER ? scammerText : null,
        reported_at: new Date().toISOString(),
        user_id,
      };

      const response = await fetch(`${ENV.FASTAPI_URL}/send-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      await response.json();

      if (response.ok) {
        Alert.alert('تم الإرسال', 'تم إرسال البلاغ بنجاح!', [
          { text: 'موافق', onPress: resetForm },
        ]);
      } else {
        Alert.alert('خطأ', 'فشل إرسال البلاغ. حاول مرة أخرى.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال البلاغ.');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, title, mainType, subType, description, phoneNumber, email, scammerText]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.primary }]}>
      <StatusBar backgroundColor={theme.primary} barStyle={theme.statusBar} />
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={[styles.headerTitle, { color: '#FFF' }]}>أبلغ عن حالة</Text>
        <TouchableOpacity style={styles.exitButton} onPress={() => navigation.navigate('reports')}>
          <Text style={[styles.exitText, { color: '#FFF' }]}>‹ خروج</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.form, { backgroundColor: theme.card }]}>
            {/* عنوان البلاغ */}
            <Text style={[styles.label, { color: theme.text }]}>عنوان البلاغ</Text>
            {validationErrors.title && <Text style={styles.errorText}>{validationErrors.title}</Text>}
            <TextInput
              style={[styles.input, { borderColor: theme.primary, color: theme.text, backgroundColor: theme.bg }]}
              placeholder="مثال: رسالة احتيال وظيفية أو بنكية"
              value={title}
              onChangeText={setTitle}
              textAlign="right"
              placeholderTextColor={theme.subtext}
            />

            {/* نوع البلاغ */}
            <Text style={[styles.label, { color: theme.text }]}>نوع البلاغ</Text>
            {validationErrors.mainType && <Text style={styles.errorText}>{validationErrors.mainType}</Text>}
            <View style={styles.caseTypeContainer}>
              {Object.values(MAIN_TYPES).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.caseTypeButton,
                    { borderColor: theme.primary, backgroundColor: mainType === type ? theme.primary : theme.card },
                  ]}
                  onPress={() => {
                    setMainType(type);
                    setSubType('');
                    setEmail('');
                    setScammerText('');
                  }}
                >
                  <Text style={[styles.caseTypeText, { color: mainType === type ? '#fff' : theme.primary }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* رقم الهاتف */}
            {mainType === MAIN_TYPES.PHONE && (
              <>
                <Text style={[styles.label, { color: theme.text }]}>رقم الهاتف</Text>
                {validationErrors.phoneNumber && <Text style={styles.errorText}>{validationErrors.phoneNumber}</Text>}
                <TextInput
                  style={[styles.input, { borderColor: theme.primary, color: theme.text, backgroundColor: theme.bg }]}
                  placeholder="0501234567"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  textAlign="right"
                  placeholderTextColor={theme.subtext}
                />
              </>
            )}

            {/* وصف الحالة */}
            <Text style={[styles.label, { color: theme.text }]}>وصف الحالة</Text>
            {validationErrors.description && <Text style={styles.errorText}>{validationErrors.description}</Text>}
            <TextInput
              style={[styles.textArea, { borderColor: theme.primary, color: theme.text, backgroundColor: theme.bg }]}
              multiline
              placeholder="اكتب وصفًا مفصلًا..."
              value={description}
              onChangeText={setDescription}
              textAlign="right"
              textAlignVertical="top"
              placeholderTextColor={theme.subtext}
            />

            {/* النوع الفرعي */}
            {mainType === MAIN_TYPES.TEXT && (
              <>
                <Text style={[styles.label, { color: theme.text }]}>اختر النوع الفرعي</Text>
                {validationErrors.subType && <Text style={styles.errorText}>{validationErrors.subType}</Text>}
                <View style={styles.caseTypeContainer}>
                  {Object.values(TEXT_SUBTYPES).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.caseTypeButton,
                        { borderColor: theme.primary, backgroundColor: subType === type ? theme.primary : theme.card },
                      ]}
                      onPress={() => {
                        setSubType(type);
                        setEmail('');
                        setScammerText('');
                      }}
                    >
                      <Text style={[styles.caseTypeText, { color: subType === type ? '#fff' : theme.primary }]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* البريد الإلكتروني */}
            {mainType === MAIN_TYPES.TEXT && subType === TEXT_SUBTYPES.EMAIL && (
              <>
                <Text style={[styles.label, { color: theme.text }]}>البريد الإلكتروني</Text>
                {validationErrors.email && <Text style={styles.errorText}>{validationErrors.email}</Text>}
                <TextInput
                  style={[styles.input, { borderColor: theme.primary, color: theme.text, backgroundColor: theme.bg }]}
                  placeholder="example@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  textAlign="right"
                  placeholderTextColor={theme.subtext}
                />
              </>
            )}

            {/* نص الرسالة */}
            {mainType === MAIN_TYPES.TEXT && subType === TEXT_SUBTYPES.SCAMMER && (
              <>
                <Text style={[styles.label, { color: theme.text }]}>نص الرسالة</Text>
                {validationErrors.scammerText && <Text style={styles.errorText}>{validationErrors.scammerText}</Text>}
                <TextInput
                  style={[styles.input, { borderColor: theme.primary, color: theme.text, backgroundColor: theme.bg }]}
                  placeholder="مثال: اسم الحساب المحتال ومنصته"
                  value={scammerText}
                  onChangeText={setScammerText}
                  textAlign="right"
                  placeholderTextColor={theme.subtext}
                />
              </>
            )}

            {/* إرسال */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: isSubmitting ? '#78909C' : theme.primary }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>إرسال البلاغ</Text>
              )}
            </TouchableOpacity>

            {/* إعادة تعيين */}
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: theme.subtext }]}
              onPress={resetForm}
            >
              <Text style={[styles.resetButtonText, { color: theme.text }]}>إعادة تعيين النموذج</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Changa-SemiBold',
    marginTop: 17,
  },
  container: { flex: 1, paddingBottom: 20, marginBottom: -30 },
  scrollContent: { padding: 16 },
  form: { borderRadius: 12, marginTop: 30, padding: 16, elevation: 3 },
  label: { fontSize: 16, fontWeight: '500', marginVertical: 8, textAlign: 'right' },
  errorText: { color: '#D32F2F', fontSize: 12, marginBottom: 4, textAlign: 'right' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 10, textAlign: 'right' },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 10,
    textAlign: 'right',
  },
  caseTypeContainer: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 16 },
  caseTypeButton: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  caseTypeText: { fontWeight: '500' },
  submitButton: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  resetButton: { borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 12 },
  resetButtonText: { fontSize: 14 },
  exitButton: { position: 'absolute', right: 16, top: 16 },
  exitText: { fontSize: 18, fontWeight: 'bold', fontFamily: 'Changa-SemiBold' },
});
