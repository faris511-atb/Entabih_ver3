/**
 * src/screens/ReportsScreen.js
 * Converted from: app/(public)/reports.tsx
 *
 * Expo → CLI changes:
 *  - `router` (expo-router) → `useNavigation` (@react-navigation/native)
 *  - `expo-constants` removed (was imported but not meaningfully used here)
 *  - `../../constants/ThemeContext` → `../constants/ThemeContext`
 *  - router.push('/(praviate)/add_report') → navigation.navigate('add_report')
 *  - All UI/logic identical to original
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../constants/ThemeContext';
import ENV from '../config';

const ReportCard = ({ report }) => {
  const { theme } = useTheme();
  const formattedDate = new Date(report.reported_at).toLocaleString();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.primary }]}>{report.title}</Text>
      <Text style={[styles.description, { color: theme.text }]}>{report.description}</Text>

      <Text style={[styles.title, { color: theme.primary }]}>المصدر</Text>
      {report.message_type && <Text style={[styles.sourceTxt, { color: theme.text }]}>{report.message_type}</Text>}
      {report.phone_number && <Text style={[styles.sourceTxt, { color: theme.text }]}>{report.phone_number}</Text>}
      {report.email && <Text style={[styles.sourceTxt, { color: theme.text }]}>{report.email}</Text>}

      <Text style={[styles.userInfo, { color: theme.subtext }]}>{formattedDate}</Text>
      <Text style={[styles.userInfo, { color: theme.subtext }]}>
        المستخدم: {report.user?.username || 'غير معروف'}
      </Text>
    </View>
  );
};

const LatestReportsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${ENV.FASTAPI_URL}/get-reports`);
      if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
      const data = await response.json();
      const sorted = [...data].sort(
        (a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime(),
      );
      setReports(sorted);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('فشل في تحميل البلاغات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const renderItem = ({ item }) => <ReportCard report={item} />;

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.text }]}>لا توجد بلاغات حالياً</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={[styles.errorText, { color: '#D32F2F' }]}>{error}</Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: theme.primary }]}
        onPress={fetchReports}
      >
        <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={theme.statusBar} />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={reports}
          renderItem={renderItem}
          keyExtractor={(item) => item.report_id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        />
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('add_report')}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, marginBottom: 16, textAlign: 'center' },
  retryButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryButtonText: { color: 'white', fontWeight: 'bold' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, textAlign: 'center' },
  listContent: { padding: 16, flexGrow: 1 },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4, textAlign: 'right' },
  sourceTxt: { marginBottom: 6, textAlign: 'right' },
  description: { marginBottom: 8, textAlign: 'right', lineHeight: 20 },
  userInfo: { fontSize: 12, textAlign: 'right', marginTop: 2 },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  addButtonText: { color: 'white', fontSize: 30, fontWeight: 'bold' },
});

export default LatestReportsScreen;
