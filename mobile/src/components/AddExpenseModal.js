import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Title, Portal, Modal, Surface, Text, Chip } from 'react-native-paper';
import { expensesAPI } from '../utils/api';

const CATEGORIES = ['Food', 'Transport', 'Health', 'Study', 'Entertainment', 'Shopping', 'Utilities', 'Other'];

export default function AddExpenseModal({ visible, onDismiss, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Other');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !notes || !category) {
      alert('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        notes,
        category,
        date: new Date().toISOString()
      };
      await expensesAPI.create(payload);
      setAmount('');
      setNotes('');
      setCategory('Other');
      onSuccess();
    } catch (err) {
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || err.message;
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Surface style={styles.card}>
          <Title style={styles.title}>Add New Expense</Title>
          
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            left={<TextInput.Affix text="₹" />}
          />

          <Text style={styles.label}>Select Category:</Text>
          <View style={styles.chipContainer}>
            {CATEGORIES.map(cat => (
              <Chip 
                key={cat} 
                selected={category === cat} 
                onPress={() => setCategory(cat)}
                style={styles.chip}
                selectedColor="#fff"
                showSelectedOverlay
              >
                {cat}
              </Chip>
            ))}
          </View>

          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            placeholder="What was this for?"
            style={styles.input}
          />

          <View style={styles.buttonRow}>
            <Button mode="outlined" onPress={onDismiss} style={styles.button}>Cancel</Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit} 
              loading={loading} 
              style={[styles.button, styles.submitBtn]}
            >
              Save
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { padding: 20 },
  card: { padding: 20, borderRadius: 20, backgroundColor: '#1e293b' },
  title: { color: '#fff', textAlign: 'center', marginBottom: 20 },
  label: { color: '#94a3b8', marginBottom: 10, fontSize: 14 },
  input: { marginBottom: 15 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { backgroundColor: '#334155' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  button: { flex: 1 },
  submitBtn: { backgroundColor: '#6366f1' }
});
