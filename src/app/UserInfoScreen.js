/**
 * src/screens/UserInfoScreen.js
 * Converted from: app/userinfo.tsx
 *
 * Expo → CLI changes:
 *  - `router` (expo-router) → `useNavigation` (@react-navigation/native)
 *  - `@react-navigation/native` useNavigation kept as-is (already in original)
 *  - router.push('/menu') → navigation.navigate('menu') inside tab navigator
 *  - All UI identical to original
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

export default function PersonalInfo() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#003c3c" barStyle="light-content" />

      {/* الشريط الأخضر العلوي */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>{'< '}القائمة</Text>
        </TouchableOpacity>
      </View>

      {/* عنوان الصفحة */}
      <Text style={styles.title}>المعلومات الشخصية</Text>

      {/* الحقول */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>الاسم</Text>
        <TextInput style={styles.input} defaultValue="محمد الصاعدي" />

        <Text style={styles.label}>البريد الإلكتروني</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address"
          defaultValue="mohammed1999043@gmail.com"
        />

        <Text style={styles.label}>تاريخ الميلاد</Text>
        <TextInput style={styles.input} defaultValue="23/05/2003" />

        <Text style={styles.label}>رقم الجوال</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          defaultValue="0552119951"
        />
      </View>

      {/* زر الحفظ */}
      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveText}>حفظ التغييرات</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  topBar: {
    backgroundColor: '#003D4D',
    paddingTop: StatusBar.currentHeight || 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D6A21E',
    alignSelf: 'center',
    marginVertical: 25,
  },
  inputContainer: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#003D4D',
    marginTop: 30,
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
