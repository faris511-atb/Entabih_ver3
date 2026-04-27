/**
 * src/app/FAQScreen.js
 * Converted from Expo FAQ screen
 *
 * Expo → CLI changes:
 *  - `router.push('/menu')` → `navigation.goBack()`
 *  - Theme fully integrated (useTheme)
 *  - All FAQ content identical to original
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../constants/ThemeContext';

const faqs = [
  {
    question: 'ما هو الغرض من هذا التطبيق؟',
    answer: 'التطبيق يهدف إلى المساعدة في كشف محاولات الاحتيال من خلال تحليل النصوص.',
  },
  {
    question: 'كيف يعمل نظام كشف الاحتيال؟',
    answer: 'يعتمد على تقنيات الذكاء الاصطناعي لتحليل النصوص وتحديد الأنماط المشبوهة.',
  },
  {
    question: 'هل البيانات التي أُدخلها آمنة؟',
    answer: 'نعم، نحن نحرص على حماية خصوصيتك، ولا نقوم بمشاركة البيانات مع أي جهة خارجية.',
  },
  {
    question: 'هل يدعم التطبيق اللغة العربية؟',
    answer: 'نعم، التطبيق يدعم اللغة العربية بشكل كامل.',
  },
  {
    question: 'هل يمكن استخدام التطبيق بدون إنترنت؟',
    answer: 'بعض الميزات تحتاج اتصال بالإنترنت لتحليل النصوص بشكل دقيق.',
  },
  {
    question: 'هل يمكنني الإبلاغ عن رسالة احتيالية؟',
    answer: 'نعم، يمكنك الإبلاغ عن أي رسالة مشبوهة من خلال قسم البلاغات في التطبيق.',
  },
  {
    question: 'كيف يتم تحليل ملفات PDF؟',
    answer: 'يمكنك رفع ملف PDF وكتابة طلبك، وسيقوم الذكاء الاصطناعي بتحليل المحتوى والإجابة على سؤالك.',
  },
];

// Expandable FAQ item
function FAQItem({ faq, theme }) {
  const [expanded, setExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggle = () => {
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity
      style={[styles.faqBox, {
        borderColor: expanded ? '#003D4D' : (theme.border || '#003c3c'),
        backgroundColor: theme.card,
      }]}
      onPress={toggle}
      activeOpacity={0.8}
    >
      <View style={styles.questionRow}>
        <Text style={[styles.arrow, { color: '#003D4D' }]}>
          {expanded ? '▲' : '▼'}
        </Text>
        <Text style={[styles.question, { color: theme.text }]}>{faq.question}</Text>
      </View>

      {expanded && (
        <Text style={[styles.answer, { color: theme.subtext }]}>{faq.answer}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function FAQScreen() {
  const navigation = useNavigation();
  const { theme }  = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar backgroundColor="#003D4D" barStyle="light-content" />

      {/* Header — back button on RIGHT */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'< '}القائمة</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: '#D6A21E' }]}>الأسئلة الشائعة</Text>

        {faqs.map((faq, index) => (
          <FAQItem key={index} faq={faq} theme={theme} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  topBar: {
    backgroundColor: '#003D4D',
    paddingTop: StatusBar.currentHeight || 44,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end', // button on RIGHT
  },
  backButton:  {},
  backText: {
    color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Changa-SemiBold',
  },
  content:     { padding: 20, paddingBottom: 40 },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 20,
    alignSelf: 'center', fontFamily: 'Changa-SemiBold',
  },
  faqBox: {
    borderWidth: 1.5, borderRadius: 14,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 }, shadowRadius: 3, elevation: 2,
  },
  questionRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 15, fontWeight: '600',
    textAlign: 'right', flex: 1,
    fontFamily: 'Changa-SemiBold',
  },
  arrow:    { fontSize: 12, marginLeft: 8 },
  answer: {
    fontSize: 14, lineHeight: 24,
    textAlign: 'right', marginTop: 12,
    paddingTop: 12, borderTopWidth: 1,
    borderTopColor: 'rgba(0,60,60,0.15)',
  },
});
