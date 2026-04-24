
/**
 * src/app/DetectorScreen.js
 *
 * Original design + logic fully preserved.
 * NEW: PDF scan section added below text input — same card, same UI style.
 *
 * New package required:
 *   npm install react-native-document-picker
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  pick,
  types,
  isCancel,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';

import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../constants/ThemeContext';

const { height } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const ENV = require('../config').default;

const FraudCheckerScreen = () => {
  // ── Text detection state (original) ────────────────────────────────────────
  const [inputText, setInputText]           = useState('');
  const [result, setResult]                 = useState('');
  const [advice, setAdvice]                 = useState('');
  const [loading, setLoading]               = useState(false);
  const [percentage, setPercentage]         = useState(0);
  const [errorMessage, setErrorMessage]     = useState(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [progress]                          = useState(new Animated.Value(0));
  const [expanded, setExpanded]             = useState(false);
  const [circleColor, setCircleColor]       = useState('#2E7D32');
  const [animationPlaying, setAnimationPlaying] = useState(false);

  // ── PDF state (new) ─────────────────────────────────────────────────────────
  const [pdfFile, setPdfFile]               = useState(null);
  const [pdfPrompt, setPdfPrompt]           = useState('');
  const [pdfLoading, setPdfLoading]         = useState(false);
  const [pdfResult, setPdfResult]           = useState(null); // { score, message }
  const [pdfError, setPdfError]             = useState(null);

  const scrollViewRef = useRef(null);
  const { user }      = useAuth();
  const navigation    = useNavigation();
  const { theme }     = useTheme();

  // ── Sanitize ──────────────────────────────────────────────────────────────
  const sanitizeInput = (text) => {
    const sanitized = text.replace(/[^؀-ۿa-zA-Z0-9\s.,!?\u060C\u061B:\-()@$]/g, '');
    setCharacterCount(sanitized.length);
    return sanitized;
  };

  // ── Text fraud check (original, unchanged) ────────────────────────────────
  const checkFraud = async (text) => {
    try {
      const response = await fetch(`${ENV.FASTAPI_URL}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();

      if (!data.classification || typeof data.percentage !== 'number' || !data.advice) {
        throw new Error('تم استلام بيانات غير مكتملة من الخادم');
      }

      return data;
    } catch (error) {
      console.error('Error in checkFraud:', error);
      return {
        classification: 'حدث خطأ في التحقق',
        percentage: 0,
        advice: 'لم نتمكن من تحليل النص. يرجى المحاولة لاحقًا.',
      };
    }
  };

  const getCircleColor = (percent) => {
    if (percent < 50) return '#D32F2F';
    if (percent < 85) return '#FF8C00';
    return '#2E7D32';
  };

  const handleCheck = async () => {
    if (!user) {
      Alert.alert('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول لاستخدام الكاشف.', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الدخول', onPress: () => navigation.navigate('login') },
      ]);
      return;
    }

    const sanitized = sanitizeInput(inputText);
    if (sanitized.length < 10) {
      setErrorMessage('النص قصير جدًا');
      return;
    }

    setLoading(true);
    setResult('');
    setAdvice('');
    setErrorMessage(null);

    try {
      const resultData    = await checkFraud(sanitized);
      const resultPercent = resultData.percentage || 0;
      setResult(resultData.classification);

      let processedAdvice = resultData.advice || '';

      if (
        !processedAdvice.includes('.') && !processedAdvice.includes('!') &&
        !processedAdvice.includes('?') && !processedAdvice.includes('؟')
      ) {
        if (processedAdvice.length > 50) {
          const midPoint  = Math.floor(processedAdvice.length / 2);
          let splitPoint  = processedAdvice.indexOf(' ', midPoint);
          if (splitPoint === -1) splitPoint = midPoint;
          processedAdvice =
            processedAdvice.substring(0, splitPoint) + '. ' +
            processedAdvice.substring(splitPoint).trim();
        }
      }

      if (
        !processedAdvice.endsWith('.') && !processedAdvice.endsWith('!') &&
        !processedAdvice.endsWith('?') && !processedAdvice.endsWith('؟')
      ) {
        processedAdvice += '.';
      }

      if (processedAdvice.length < 50) {
        processedAdvice += ' يرجى توخي الحذر عند التعامل مع مثل هذه النصوص والتحقق من المرسل.';
      }

      setAdvice(processedAdvice);
      setPercentage(resultPercent);
      setCircleColor(getCircleColor(resultPercent));
      animateProgress(resultPercent);
      setExpanded(true);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (error) {
      console.error('Error during check:', error);
      setErrorMessage('حدث خطأ أثناء التحقق');
    } finally {
      setLoading(false);
    }
  };

  const animateProgress = (value) => {
    setAnimationPlaying(true);
    Animated.timing(progress, {
      toValue: value / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start(() => setAnimationPlaying(false));
  };

  const circleRadius     = 45;
  const circumference    = 2 * Math.PI * circleRadius;
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1], outputRange: [circumference, 0],
  });

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) setInputText(sanitizeInput(text));
    } catch (e) {
      console.error('Failed to paste text:', e);
    }
  };

  // ── PDF: pick file ────────────────────────────────────────────────────────
 const handlePickPdf = async () => {
  try {
    const [result] = await pick({
      type: [types.pdf],
      allowMultiSelection: false,
    });

    setPdfFile(result);
    setPdfResult(null);
    setPdfError(null);

  } catch (err) {
    if (isCancel(err)) {
      // user cancelled — do nothing
      return;
    }
    if (isErrorWithCode(err, errorCodes.inProgress)) {
      return;
    }
    Alert.alert('خطأ', 'تعذر اختيار الملف.');
  }
};

  // ── PDF: analyze ──────────────────────────────────────────────────────────
  const handlePdfAnalyze = async () => {
    if (!user) {
      Alert.alert('تسجيل الدخول مطلوب', 'يجب تسجيل الدخول لاستخدام الكاشف.', [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الدخول', onPress: () => navigation.navigate('login') },
      ]);
      return;
    }

    if (!pdfFile) {
      Alert.alert('تنبيه', 'يرجى اختيار ملف PDF أولاً.');
      return;
    }

    if (!pdfPrompt.trim() || pdfPrompt.trim().length < 5) {
      Alert.alert('تنبيه', 'يرجى كتابة طلبك (5 أحرف على الأقل).');
      return;
    }

    setPdfLoading(true);
    setPdfResult(null);
    setPdfError(null);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri:  pdfFile.uri,
        type: 'application/pdf',
        name: pdfFile.name || 'document.pdf',
      });
      formData.append('user_prompt', pdfPrompt.trim());

      const response = await fetch(`${ENV.FASTAPI_URL}/scan-pdf`, {
        method:  'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body:    formData,
      });

      // ADD this safety check before parsing JSON
const contentType = response.headers.get('content-type') || '';
if (!contentType.includes('application/json')) {
  setPdfError('خطأ في الخادم. يرجى التحقق من تشغيل الباكند.');
  return;
}

      const data = await response.json();

      if (!response.ok) {
        setPdfError(data.detail || 'حدث خطأ أثناء التحليل.');
        return;
      }

      setPdfResult(data); // { score, message }
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    } catch (e) {
      console.error('PDF scan error:', e);
      setPdfError('تعذر الاتصال بالخادم. تحقق من الشبكة.');
    } finally {
      setPdfLoading(false);
    }
  };

  const getPdfScoreColor = (s) => {
  if (s >= 75) return '#D32F2F';  // red = problem found
  if (s >= 40) return '#FF8C00';  // orange = suspicious
  return '#2E7D32';               // green = clean
};

  const getPdfScoreLabel = (s) => {
  if (s >= 75) return 'نسبة عالية من المخاوف المُكتشفة';
  if (s >= 40) return 'يستحق المراجعة الدقيقة';
  return 'لم يتم رصد مشكلة واضحة';
};

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.scrollContainer, { paddingTop: height * 0.05 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header (original) ── */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: theme.text }]}>الكاشف الذكي</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            تحقق من صحة الرسائل النصية
          </Text>
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            TEXT DETECTION CARD (original — untouched)
        ════════════════════════════════════════════════════════════════════ */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.text, textAlign: 'right' }]}>النص:</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, {
                borderColor: 'transparent',
                color: theme.text,
                textAlign: 'right',
                backgroundColor: 'rgba(10, 147, 150, 0.08)',
                borderRightWidth: 3,
                borderRightColor: '#0A9396',
              }]}
              multiline
              value={inputText}
              onChangeText={(t) => setInputText(sanitizeInput(t))}
              placeholder="اكتب هنا الرسالة للتحقق منها..."
              placeholderTextColor={theme.subtext}
              maxLength={1000}
            />
            <TouchableOpacity style={styles.pasteButton} onPress={handlePaste}>
              <Text style={styles.pasteButtonText}>لصق</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.textInfoRow}>
            <Text style={{ color: theme.subtext, fontSize: 12 }}>الحد الأدنى: 10 أحرف</Text>
            <Text style={{
              color: characterCount >= 10 ? '#0A9396' : theme.subtext,
              fontWeight: characterCount >= 10 ? '600' : '400',
            }}>
              {characterCount}/1000
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            {inputText.length > 0 && (
              <TouchableOpacity
                style={[styles.clearTextButton, {
                  backgroundColor: theme.dark ? '#873e3e' : '#E57373',
                }]}
                onPress={() => setInputText('')}
              >
                <Text style={styles.clearTextButtonText}>مسح النص</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleCheck}
              style={[styles.checkButton, {
                backgroundColor: inputText.length >= 10 ? '#003D4D' : '#9DB2B8',
                opacity: loading ? 0.7 : 1,
                flex: 2,
              }]}
              disabled={loading || inputText.length < 10}
            >
              {loading ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.buttonText}>جاري التحقق...</Text>
                </>
              ) : (
                <Text style={styles.buttonText}>تحقق من النص</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Divider ── */}
          <View style={[styles.divider, { backgroundColor: theme.border || '#E0E0E0' }]} />

          {/* ════════════════════════════════════════════════════════════════
              PDF SECTION — added inside same card, below divider
          ════════════════════════════════════════════════════════════════ */}
          <Text style={[styles.label, { color: theme.text, textAlign: 'right' }]}>
            تحليل ملف PDF:
          </Text>

          {/* Pick PDF button */}
          <TouchableOpacity
            style={[styles.pdfPickButton, { borderColor: '#0A9396' }]}
            onPress={handlePickPdf}
          >
            <Text style={styles.pdfPickIcon}>📄</Text>
            <Text style={[styles.pdfPickText, { color: '#0A9396' }]}>
              {pdfFile ? pdfFile.name : 'اختر ملف PDF'}
            </Text>
          </TouchableOpacity>

          {/* PDF prompt input */}
          <TextInput
            style={[styles.pdfPromptInput, {
              color: theme.text,
              backgroundColor: 'rgba(10, 147, 150, 0.08)',
              borderRightWidth: 3,
              borderRightColor: '#0A9396',
            }]}
            placeholder="اكتب طلبك... (مثال: هل هذا عقد حقيقي؟)"
            placeholderTextColor={theme.subtext}
            value={pdfPrompt}
            onChangeText={setPdfPrompt}
            multiline
            numberOfLines={2}
            textAlign="right"
            textAlignVertical="top"
          />

          {/* Analyze PDF button */}
          <TouchableOpacity
            onPress={handlePdfAnalyze}
            style={[styles.checkButton, {
              backgroundColor:
                pdfFile && pdfPrompt.trim().length >= 5 ? '#003D4D' : '#9DB2B8',
              opacity: pdfLoading ? 0.7 : 1,
              marginTop: 10,
            }]}
            disabled={pdfLoading || !pdfFile || pdfPrompt.trim().length < 5}
          >
            {pdfLoading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.buttonText}>  جاري التحليل...</Text>
              </>
            ) : (
              <Text style={styles.buttonText}>تحليل المستند</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Text error (original) ── */}
        {errorMessage && (
          <View style={[styles.errorCard, { backgroundColor: theme.card }]}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* ── PDF error ── */}
        {pdfError && (
          <View style={[styles.errorCard, { backgroundColor: theme.card }]}>
            <Text style={styles.errorText}>{pdfError}</Text>
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TEXT RESULT (original — untouched)
        ════════════════════════════════════════════════════════════════════ */}
        {result && (
          <>
            <View style={[styles.legendRow, { backgroundColor: theme.card }]}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#D32F2F' }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>احتيال مرتفع</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF8C00' }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>احتيال محتمل</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>
                  لم يتم رصد سلوك الاحتيال
                </Text>
              </View>
            </View>

            <View style={[styles.resultCard, {
              backgroundColor: theme.card,
              borderColor: animationPlaying ? circleColor : 'transparent',
            }]}>
              <Text style={[styles.result, { color: theme.text }]}>نسبة سلامة النص</Text>

              <View style={{ alignItems: 'center', marginVertical: 16 }}>
                <Svg height="130" width="130">
                  <Circle
                    cx="65" cy="65" r={circleRadius}
                    stroke={theme.dark ? '#444' : '#eee'}
                    strokeWidth="10" fill="none"
                  />
                  <AnimatedCircle
                    cx="65" cy="65" r={circleRadius}
                    stroke={circleColor}
                    strokeWidth="10"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, marginTop: 8 }}>
                  {percentage}%
                </Text>
                <Text style={[styles.resultLabel, { color: circleColor }]}>{result}</Text>
              </View>

              <TouchableOpacity
                onPress={() => setExpanded(!expanded)}
                style={[styles.toggleButton, {
                  borderColor: expanded ? '#0A9396' : '#0077cc',
                  backgroundColor: expanded ? 'rgba(10, 147, 150, 0.1)' : 'transparent',
                }]}
              >
                <Text style={{
                  color: expanded ? '#0A9396' : '#0077cc',
                  textAlign: 'center', fontWeight: '600',
                }}>
                  {expanded ? 'إخفاء النصيحة' : 'عرض النصيحة'}
                </Text>
              </TouchableOpacity>

              {expanded && (
                <View style={[styles.adviceContainer, {
                  backgroundColor: theme.dark
                    ? 'rgba(10, 147, 150, 0.1)'
                    : 'rgba(10, 147, 150, 0.05)',
                }]}>
                  <Text style={[styles.adviceText, {
                    color: theme.dark ? '#a7c9c9' : '#2A4747',
                  }]}>
                    {advice}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            PDF RESULT — same visual style as text result
        ════════════════════════════════════════════════════════════════════ */}
        {pdfResult && (
          <View style={[styles.resultCard, {
            backgroundColor: theme.card,
            borderColor: getPdfScoreColor(pdfResult.score),
          }]}>
            <Text style={[styles.result, { color: theme.text }]}>نتيجة تحليل المستند</Text>

            <View style={{ alignItems: 'center', marginVertical: 16 }}>
              <View style={[styles.pdfScoreCircle, {
                borderColor: getPdfScoreColor(pdfResult.score),
              }]}>
                <Text style={[styles.pdfScoreNumber, {
                  color: getPdfScoreColor(pdfResult.score),
                }]}>
                  {Math.round(pdfResult.score)}%
                </Text>
              </View>
              <Text style={[styles.resultLabel, {
                color: getPdfScoreColor(pdfResult.score), marginTop: 10,
              }]}>
                {getPdfScoreLabel(pdfResult.score)}
              </Text>
            </View>

            <View style={[styles.adviceContainer, {
              backgroundColor: theme.dark
                ? 'rgba(10, 147, 150, 0.1)'
                : 'rgba(10, 147, 150, 0.05)',
            }]}>
              <Text style={[styles.adviceText, {
                color: theme.dark ? '#a7c9c9' : '#2A4747',
              }]}>
                {pdfResult.message}
              </Text>
            </View>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    padding: 16, paddingBottom: 40, paddingTop: height * 0.03,
    minHeight: '100%', justifyContent: 'flex-start',
  },
  headerContainer: { marginBottom: 20, alignItems: 'center' },
  title:    { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', marginTop: 6, opacity: 0.8 },
  card: {
    borderRadius: 16, padding: 18, marginBottom: 18,
    shadowColor: '#000', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3,
  },
  resultCard: {
    borderRadius: 16, padding: 18, marginBottom: 18,
    shadowColor: '#000', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3,
    borderWidth: 1, borderColor: 'transparent',
  },
  errorCard: {
    borderRadius: 14, padding: 12, marginBottom: 18,
    borderLeftWidth: 4, borderLeftColor: '#D32F2F',
  },
  errorText: { color: '#D32F2F', textAlign: 'center', fontSize: 15, fontWeight: '500' },
  label: { fontSize: 16, marginBottom: 10, fontWeight: '600' },
  inputContainer: { position: 'relative', width: '100%' },
  input: {
    borderWidth: 1, borderRadius: 14, padding: 16,
    paddingRight: 18, paddingLeft: 55,
    fontSize: 16, height: 120, textAlignVertical: 'top',
  },
  pasteButton: {
    position: 'absolute', left: 10, bottom: 10,
    backgroundColor: 'rgba(10, 147, 150, 0.9)',
    borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 1.5,
  },
  pasteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  textInfoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 8, marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 16,
  },
  clearTextButton: {
    paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12,
    marginRight: 12, flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  clearTextButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  checkButton: {
    padding: 14, borderRadius: 12,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

  // ── Divider ──
  divider: { height: 1, marginVertical: 20, opacity: 0.4 },

  // ── PDF section ──
  pdfPickButton: {
    borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 12,
    padding: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', marginBottom: 12,
  },
  pdfPickIcon: { fontSize: 20, marginRight: 8 },
  pdfPickText: { fontSize: 14, fontWeight: '600' },
  pdfPromptInput: {
    borderWidth: 1, borderColor: 'transparent', borderRadius: 12,
    padding: 14, fontSize: 15, minHeight: 70, textAlignVertical: 'top',
  },

  // ── PDF result ──
  pdfScoreCircle: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 8, alignItems: 'center', justifyContent: 'center',
  },
  pdfScoreNumber: { fontSize: 26, fontWeight: 'bold' },

  // ── Text result (original) ──
  result:      { fontSize: 22, textAlign: 'center', marginBottom: 16, fontWeight: 'bold' },
  resultLabel: { fontSize: 18, textAlign: 'center', marginTop: 8, fontWeight: 'bold' },
  legendRow: {
    flexDirection: 'row-reverse', justifyContent: 'space-around',
    padding: 14, borderRadius: 14, marginBottom: 18,
  },
  legendItem: { flexDirection: 'row-reverse', alignItems: 'center' },
  legendDot:  { width: 12, height: 12, borderRadius: 6, marginLeft: 6 },
  legendText: { fontSize: 13 },
  toggleButton: {
    paddingVertical: 10, paddingHorizontal: 22, borderRadius: 20,
    borderWidth: 1, alignSelf: 'center', marginVertical: 14,
  },
  adviceContainer: {
    marginTop: 12, paddingVertical: 16, paddingHorizontal: 18,
    borderRadius: 14, borderRightWidth: 3, borderRightColor: '#0A9396',
  },
  adviceText: { textAlign: 'right', lineHeight: 26, fontSize: 16, fontWeight: '500' },
});

export default FraudCheckerScreen;
