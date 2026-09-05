import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Title, Portal, Modal, Surface } from 'react-native-paper';
import { budgetAPI } from '../utils/api';

export default function SetBudgetModal({ visible, onDismiss, onSuccess, currentBudget }) {
  const [amount, setAmount] = useState(currentBudget?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      console.log('Updating budget to:', amount);
      const res = await budgetAPI.set({ monthlyBudget: parseFloat(amount) });
      console.log('Budget updated successfully:', res.data);
      onSuccess();
    } catch (err) {
      console.error('Budget update error:', err.response?.data || err.message);
      alert('Failed to update budget: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Surface style={styles.card}>
          <Title style={styles.title}>Set Monthly Budget</Title>
          <TextInput
            label="Monthly Limit"
            value={amount}
            onChangeText={setAmount}
            mode="outlined"
            keyboardType="numeric"
            left={<TextInput.Affix text="₹" />}
            style={styles.input}
          />
          <View style={styles.buttonRow}>
            <Button mode="outlined" onPress={onDismiss} style={styles.button}>Cancel</Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit} 
              loading={loading} 
              style={[styles.button, { backgroundColor: '#10b981' }]}
            >
              Update
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
  input: { marginBottom: 20 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  button: { flex: 1 }
});
