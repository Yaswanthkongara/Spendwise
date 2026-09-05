import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { Title, Text, Surface, ActivityIndicator } from 'react-native-paper';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { expensesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await expensesAPI.getAnalytics();
      setAnalytics(res.data.data || res.data);
    } catch (err) {
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const chartConfig = {
    backgroundColor: '#1e293b',
    backgroundGradientFrom: '#1e293b',
    backgroundGradientTo: '#1e293b',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    barPercentage: 0.5,
  };

  const pieData = (analytics?.categoryBreakdown || []).map((cat, idx) => ({
    name: cat._id,
    population: cat.total,
    color: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][idx % 6],
    legendFontColor: '#94a3b8',
    legendFontSize: 12,
  }));

  // Prepare Bar Chart Data (Daily Totals)
  const barData = {
    labels: (analytics?.dailyTotals || []).slice(-7).map(d => d._id.split('-')[2]), // Last 7 days
    datasets: [{
      data: (analytics?.dailyTotals || []).slice(-7).map(d => d.total)
    }]
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#6366f1" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Spending Insights</Title>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        {/* Category Pie Chart */}
        <Surface style={styles.card}>
          <Title style={styles.cardTitle}>Category Breakdown</Title>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={screenWidth - 60}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text style={styles.emptyText}>No category data yet</Text>
          )}
        </Surface>

        {/* Daily Spending Bar Chart */}
        <Surface style={styles.card}>
          <Title style={styles.cardTitle}>Last 7 Days (Trend)</Title>
          {barData.datasets[0].data.length > 0 ? (
            <BarChart
              data={barData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              fromZero
              showValuesOnTopOfBars
            />
          ) : (
            <Text style={styles.emptyText}>No daily data yet</Text>
          )}
        </Surface>

        <View style={styles.row}>
          <Surface style={styles.miniCard}>
            <Text style={styles.miniLabel}>Total Spent</Text>
            <Text style={styles.miniValue}>{user?.currency || '₹'}{(analytics?.thisMonthTotal || 0).toLocaleString()}</Text>
          </Surface>
          <Surface style={styles.miniCard}>
            <Text style={styles.miniLabel}>Categories</Text>
            <Text style={styles.miniValue}>{analytics?.categoryBreakdown?.length || 0}</Text>
          </Surface>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60 },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  scrollContent: { padding: 20 },
  card: { padding: 15, borderRadius: 20, backgroundColor: '#1e293b', marginBottom: 20, elevation: 4 },
  cardTitle: { color: '#fff', fontSize: 16, marginBottom: 15 },
  emptyText: { color: '#94a3b8', textAlign: 'center', padding: 20 },
  row: { flexDirection: 'row', gap: 15 },
  miniCard: { flex: 1, padding: 20, borderRadius: 15, backgroundColor: '#1e293b', alignItems: 'center' },
  miniLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 5 },
  miniValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
