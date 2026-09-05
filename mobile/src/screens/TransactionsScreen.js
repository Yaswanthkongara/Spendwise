import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Title, IconButton, Portal, Modal, Surface, TextInput, Button } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { expensesAPI } from '../utils/api';

export default function TransactionsScreen() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await expensesAPI.getAll();
      setExpenses(res.data.data || res.data.expenses || []);
    } catch (err) {
      console.error('Fetch transactions error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const handleEditPress = (item) => {
    setSelectedExpense(item);
    setEditAmount(item.amount.toString());
    setEditNotes(item.notes);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      await expensesAPI.update(selectedExpense._id, {
        amount: parseFloat(editAmount),
        notes: editNotes
      });
      setEditModalVisible(false);
      onRefresh();
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await expensesAPI.delete(id);
        onRefresh();
      }}
    ]);
  };

  const currency = user?.currency || '₹';

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Transactions</Title>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        {expenses.length === 0 ? (
          <Text style={styles.emptyText}>No transactions found.</Text>
        ) : (
          expenses.map((item) => (
            <Card key={item._id} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.iconBox}><Text style={{ fontSize: 20 }}>💸</Text></View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.description}>{item.notes}</Text>
                  <Text style={styles.categoryText}>{item.category} • {new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.amount}>-{currency}{item.amount.toLocaleString()}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <IconButton icon="pencil" size={16} iconColor="#6366f1" onPress={() => handleEditPress(item)} style={{ margin: 0 }} />
                    <IconButton icon="delete" size={16} iconColor="#ef4444" onPress={() => handleDelete(item._id)} style={{ margin: 0 }} />
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Portal>
        <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={styles.modalContainer}>
          <Surface style={styles.modalCard}>
            <Title style={styles.modalTitle}>Edit Expense</Title>
            <TextInput label="Amount" value={editAmount} onChangeText={setEditAmount} mode="outlined" keyboardType="numeric" style={styles.input} left={<TextInput.Affix text="₹" />} />
            <TextInput label="Notes" value={editNotes} onChangeText={setEditNotes} mode="outlined" style={styles.input} />
            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setEditModalVisible(false)} style={{ flex: 1 }}>Cancel</Button>
              <Button mode="contained" onPress={handleUpdate} style={{ flex: 1, backgroundColor: '#6366f1', marginLeft: 10 }}>Update</Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#1e293b', marginBottom: 12, borderRadius: 15 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 45, height: 45, borderRadius: 12, backgroundColor: 'rgba(99, 102, 241, 0.1)', justifyContent: 'center', alignItems: 'center' },
  description: { color: '#fff', fontSize: 16, fontWeight: '600' },
  categoryText: { color: '#94a3b8', fontSize: 12 },
  amount: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' },
  emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 50 },
  modalContainer: { padding: 20 },
  modalCard: { padding: 25, borderRadius: 25, backgroundColor: '#1e293b' },
  modalTitle: { color: '#fff', textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 15 },
  modalActions: { flexDirection: 'row', marginTop: 10 }
});
