/**
 * src/screens/FeedbacksScreen.js
 * Converted from: app/feedbacks.tsx
 *
 * Expo → CLI changes:
 *  - `router` (expo-router) → `useNavigation` (@react-navigation/native)
 *  - `useFonts` (expo-font) → removed (fonts auto-linked via react-native.config.js)
 *  - `@/app/context/AuthContext` → `../context/AuthContext`
 *  - router.push('/login')       → navigation.navigate('login')
 *  - router.replace('/menu')     → navigation.navigate('menu') [tab screen]
 *  - router.replace('/homescreen') → navigation.navigate('homescreen') [tab screen]
 *  - All UI/logic identical to original
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  ScrollView,
  Alert,
  I18nManager,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import ENV from '../config';

// Force RTL layout direction globally
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function FeedbackScreen() {
  const [feedback, setFeedback] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [rating, setRating] = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [buttonScale] = useState(new Animated.Value(1));

  const navigation = useNavigation();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(
        'تسجيل الدخول مطلوب',
        'يجب تسجيل الدخول قبل إرسال رأيك.',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'تسجيل الدخول', onPress: () => navigation.navigate('login') },
        ],
      );
      return;
    }

    if (!feedback || !selectedTag || rating === null) {
      Alert.alert('تنبيه', 'يرجى ملء جميع الحقول!');
      return;
    }

    const payload = {
      feedback_text: feedback,
      selected_tag: selectedTag,
      rating: rating,
    };

    try {
      const response = await fetch(`${ENV.FASTAPI_URL}/feedbacks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('تم الإرسال', '✅ تم إرسال رأيك بنجاح! شكراً لتعاونك.');
        setFeedback('');
        setSelectedTag('');
        setRating(null);
        setSelectedEmoji(null);
        setTimeout(() => navigation.navigate('homescreen'), 1000);
      } else {
        Alert.alert('خطأ', data.detail || 'حدث خطأ ما، حاول مرة أخرى.');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال التعليق، تأكد من الاتصال بالإنترنت.');
    }
  };

  const handleTagPress = (tagLabel) => {
    setSelectedTag(tagLabel);
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(buttonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const emojis = [
    { emoji: '☹️', value: 1 },
    { emoji: '😐', value: 3 },
    { emoji: '😊', value: 5 },
  ];

  const feedbackTags = [
    { id: 'speed', label: 'السرعة والكفاءة' },
    { id: 'service', label: 'الخدمة الشاملة' },
    { id: 'support', label: 'دعم العملاء' },
    { id: 'fraud', label: 'دقة الكشف عن الاحتيال' },
    { id: 'other', label: 'آخر' },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#003c3c" barStyle="light-content" />

      <View style={styles.topBar}>
        <View style={styles.textcontainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'< رجوع'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>أخبرنا برأيك</Text>

        <View style={styles.emojiRow}>
          {emojis.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setRating(item.value);
                setSelectedEmoji(item.emoji);
              }}
            >
              <Text style={[
                styles.emoji,
                selectedEmoji === item.emoji && styles.selectedEmoji,
              ]}>
                {item.emoji}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.question}>ما الذي يجب أن نحسّنه؟</Text>

        <View style={styles.tagsContainer}>
          {feedbackTags.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.tagButton,
                selectedTag === item.label && styles.selectedTagButton,
              ]}
              onPress={() => handleTagPress(item.label)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.tagText,
                selectedTag === item.label && styles.selectedTagText,
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.note}>من فضلك ، عبّر برأيك عن التطبيق</Text>
        <TextInput
          style={styles.textArea}
          placeholder="أخبرنا بالمزيد عن تجربتك..."
          placeholderTextColor="#8A8A8A"
          multiline
          numberOfLines={5}
          value={feedback}
          onChangeText={setFeedback}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>ارسل</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.navigate('menu')}
        >
          <Text style={styles.cancelText}>إلغاء</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#F5F7FA' },
  topBar: {
    backgroundColor: '#003D4D',
    paddingHorizontal: 20,
    paddingVertical: 55,
    marginTop: -50,
    alignItems: 'flex-end',
  },
  textcontainer: { marginBottom: -40 },
  backText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Changa-SemiBold',
  },
  content: {
    padding: 15,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    color: '#003D4D',
    fontSize: 22,
    marginTop: 10,
    marginBottom: 12,
    textAlign: 'right',
    fontFamily: 'Changa-SemiBold',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 5,
    marginBottom: 10,
  },
  emoji: { fontSize: 36, opacity: 0.6 },
  selectedEmoji: { opacity: 1, transform: [{ scale: 1.3 }] },
  question: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
    textAlign: 'right',
    fontFamily: 'Changa-SemiBold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
    width: '100%',
    paddingHorizontal: 5,
  },
  tagButton: {
    backgroundColor: '#F9FCFD',
    borderWidth: 1.5,
    borderColor: '#003D4D',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  selectedTagButton: { backgroundColor: '#003D4D', borderColor: '#002a2a' },
  tagText: {
    color: '#003c3c',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Changa-SemiBold',
  },
  selectedTagText: { color: '#ffffff' },
  note: {
    marginTop: 15,
    marginBottom: 6,
    textAlign: 'right',
    color: '#333',
    fontSize: 14,
    fontFamily: 'Changa-SemiBold',
  },
  textArea: {
    borderColor: '#003c3c',
    borderWidth: 1.5,
    borderRadius: 10,
    width: '100%',
    padding: 12,
    textAlignVertical: 'top',
    textAlign: 'right',
    fontSize: 14,
    minHeight: 100,
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#003D4D',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 45,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Changa-SemiBold',
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 45,
    borderRadius: 10,
    borderColor: '#888',
    borderWidth: 1.2,
  },
  cancelText: {
    color: '#444',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Changa-SemiBold',
  },
});
