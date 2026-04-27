
/**
 * src/app/FeedbacksScreen.js
 *
 * Fixed:
 *  - Theme fully integrated (useTheme) — all colors use theme
 *  - Back button fixed: goBack() works correctly and positioned on the RIGHT
 *  - All original logic and UI preserved
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
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import { useTheme } from '../constants/ThemeContext';
const ENV = require('../config').default;

export default function FeedbackScreen() {
  const [feedback, setFeedback]         = useState('');
  const [selectedTag, setSelectedTag]   = useState('');
  const [rating, setRating]             = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [buttonScale]                   = useState(new Animated.Value(1));

  const navigation = useNavigation();
  const { user }   = useAuth();
  const { theme }  = useTheme();

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
      selected_tag:  selectedTag,
      rating:        rating,
    };

    try {
      const response = await fetch(`${ENV.FASTAPI_URL}/feedbacks/`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('تم الإرسال', '✅ تم إرسال رأيك بنجاح! شكراً لتعاونك.');
        setFeedback('');
        setSelectedTag('');
        setRating(null);
        setSelectedEmoji(null);
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        Alert.alert('خطأ', data.detail || 'حدث خطأ ما، حاول مرة أخرى.');
      }
    } catch (error) {
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
    { id: 'speed',   label: 'السرعة والكفاءة' },
    { id: 'service', label: 'الخدمة الشاملة' },
    { id: 'support', label: 'دعم العملاء' },
    { id: 'fraud',   label: 'دقة الكشف عن الاحتيال' },
    { id: 'other',   label: 'آخر' },
  ];

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme.bg }]} edges={['bottom']}>
      <StatusBar backgroundColor="#003D4D" barStyle="light-content" />

      {/* Header — back button on RIGHT */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'< '}رجوع</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>أخبرنا برأيك</Text>

        {/* Emoji rating */}
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

        <Text style={[styles.question, { color: theme.text }]}>ما الذي يجب أن نحسّنه؟</Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {feedbackTags.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.tagButton,
                { borderColor: theme.primary, backgroundColor: selectedTag === item.label ? theme.primary : theme.card },
              ]}
              onPress={() => handleTagPress(item.label)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.tagText,
                { color: selectedTag === item.label ? '#ffffff' : theme.text },
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.note, { color: theme.text }]}>من فضلك ، عبّر برأيك عن التطبيق</Text>

        <TextInput
          style={[styles.textArea, {
            borderColor: '#003D4D',
            color: theme.text,
            backgroundColor: theme.card,
          }]}
          placeholder="أخبرنا بالمزيد عن تجربتك..."
          placeholderTextColor={theme.subtext}
          multiline
          numberOfLines={5}
          value={feedback}
          onChangeText={setFeedback}
          textAlign="right"
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>ارسل</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.border || '#888' }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelText, { color: theme.text }]}>إلغاء</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  topBar: {
    backgroundColor: '#003D4D',
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end', // back button on RIGHT
  },
  backButton:  {},
  backText: {
    color: '#fff', fontSize: 18, fontWeight: '600', fontFamily: 'Changa-SemiBold',
  },
  content:     { padding: 20, paddingBottom: 40, alignItems: 'center' },
  title: {
    fontSize: 22, marginTop: 10, marginBottom: 12,
    textAlign: 'right', fontFamily: 'Changa-SemiBold', alignSelf: 'flex-end',
  },
  emojiRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '60%', marginTop: 5, marginBottom: 10,
  },
  emoji:         { fontSize: 36, opacity: 0.6 },
  selectedEmoji: { opacity: 1, transform: [{ scale: 1.3 }] },
  question: {
    fontSize: 16, marginTop: 15, marginBottom: 10,
    textAlign: 'right', fontFamily: 'Changa-SemiBold', alignSelf: 'flex-end',
  },
  tagsContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', marginVertical: 10,
    width: '100%', paddingHorizontal: 5,
  },
  tagButton: {
    borderWidth: 1.5, borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 16,
    margin: 5, elevation: 1,
  },
  tagText: { fontSize: 14, fontWeight: '500', fontFamily: 'Changa-SemiBold' },
  note: {
    marginTop: 15, marginBottom: 6, textAlign: 'right',
    fontSize: 14, fontFamily: 'Changa-SemiBold', alignSelf: 'flex-end',
  },
  textArea: {
    borderWidth: 1.5, borderRadius: 10,
    width: '100%', padding: 12,
    fontSize: 14, minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#003D4D', marginTop: 20,
    paddingVertical: 12, paddingHorizontal: 45,
    borderRadius: 10, elevation: 3,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'Changa-SemiBold' },
  cancelButton: {
    marginTop: 8, paddingVertical: 10, paddingHorizontal: 45,
    borderRadius: 10, borderWidth: 1.2,
  },
  cancelText: { fontSize: 15, textAlign: 'center', fontFamily: 'Changa-SemiBold' },
});
