import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Surface, Title, Card, IconButton, FAB } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { expensesAPI, budgetAPI } from '../utils/api';
import AddExpenseModal from '../components/AddExpenseModal';
import SetBudgetModal from '../components/SetBudgetModal';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, budgetRes] = await Promise.all([
        expensesAPI.getAnalytics(),
        budgetAPI.get(),
      ]);
      setSummary(summaryRes.data.data || summaryRes.data);
      setBudget(budgetRes.data.data || budgetRes.data);
    } catch (err) {
      console.error('Fetch dashboard error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const currency = user?.currency || '₹';
  const totalBudget = budget?.monthlyBudget || 0;
  const totalSpent = summary?.thisMonthTotal || 0;
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Title style={styles.userName}>{user?.name}</Title>
        </View>
        <IconButton icon="logout" iconColor="#94a3b8" onPress={logout} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        <Text style={styles.monthLabel}>
          {monthName} Summary
        </Text>
        <Text style={styles.updateTime}>Last updated: {new Date().toLocaleTimeString()}</Text>
        
        <Surface style={styles.mainCard}>
          <Text style={styles.cardLabel}>Current Month Summary</Text>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.statLabel}>Budget</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.statValue}>{currency}{totalBudget.toLocaleString()}</Text>
                <IconButton icon="pencil" size={16} iconColor="#6366f1" onPress={() => setBudgetModalVisible(true)} style={{ margin: 0 }} />
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{currency}{totalSpent.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.balanceBox}>
             <Text style={styles.statLabel}>Remaining Balance</Text>
             <Text style={[styles.balanceValue, { color: '#10b981' }]}>
               {currency}{(totalBudget - totalSpent).toLocaleString()}
             </Text>
          </View>
        </Surface>

        <Title style={styles.sectionTitle}>Top Categories</Title>
        {(summary?.categoryBreakdown || []).map((cat, idx) => (
          <Card key={idx} style={styles.catCard}>
            <Card.Content style={styles.catContent}>
              <View style={styles.catIconBox}><Text style={styles.catEmoji}>📊</Text></View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.catName}>{cat._id}</Text>
                <Text style={styles.catCount}>{cat.count} transactions</Text>
              </View>
              <Text style={styles.catAmount}>{currency}{cat.total.toLocaleString()}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setModalVisible(true)} color="#fff" />
      <AddExpenseModal visible={modalVisible} onDismiss={() => setModalVisible(false)} onSuccess={() => { setModalVisible(false); onRefresh(); }} />
      <SetBudgetModal visible={budgetModalVisible} onDismiss={() => setBudgetModalVisible(false)} currentBudget={totalBudget} onSuccess={() => { setBudgetModalVisible(false); onRefresh(); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 10 },
  greeting: { color: '#94a3b8', fontSize: 14 },
  userName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  mainCard: { padding: 20, borderRadius: 20, backgroundColor: '#1e293b', marginBottom: 20 },
  cardLabel: { color: '#6366f1', fontSize: 12, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  balanceBox: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 15 },
  balanceValue: { fontSize: 28, fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 18, marginBottom: 15 },
  catCard: { backgroundColor: '#1e293b', marginBottom: 12, borderRadius: 15 },
  catContent: { flexDirection: 'row', alignItems: 'center' },
  catIconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(99, 102, 241, 0.15)', justifyContent: 'center', alignItems: 'center' },
  catEmoji: { fontSize: 20 },
  catName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  catCount: { color: '#94a3b8', fontSize: 12 },
  catAmount: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 20, backgroundColor: '#6366f1', borderRadius: 30 },
  monthLabel: { color: '#6366f1', fontSize: 18, fontWeight: 'bold', marginBottom: 5, textTransform: 'uppercase' },
  updateTime: { color: '#475569', fontSize: 10, marginBottom: 15 },
  insightCard: { },
});
