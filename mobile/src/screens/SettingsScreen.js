import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Title, List, Avatar, Button, Surface, Portal, Modal, RadioButton, TextInput, Divider } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../utils/api';

const CURRENCIES = [
  { label: 'Indian Rupee (₹)', value: '₹' },
  { label: 'US Dollar ($)', value: '$' },
  { label: 'Euro (€)', value: '€' },
  { label: 'British Pound (£)', value: '£' },
];

export default function SettingsScreen() {
  const { user, logout, setUser } = useAuth();
  const [currencyModal, setCurrencyModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCurrencyChange = async (newCurrency) => {
    try {
      const res = await usersAPI.updateCurrency({ currency: newCurrency });
      setUser(res.data.user);
      setCurrencyModal(false);
    } catch (err) {
      alert('Failed to update currency');
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.updateProfile({ name, email });
      setUser(res.data.user);
      setProfileModal(false);
      alert('Profile updated!');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    try {
      await usersAPI.changePassword({ currentPassword, newPassword });
      setPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      alert('Password updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data",
      "This will permanently delete all your expenses. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive", 
          onPress: async () => {
            try {
              await usersAPI.resetData();
              alert('Data reset successful! Please refresh your dashboard.');
            } catch (err) {
              alert('Reset failed');
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.profileCard}>
          <Avatar.Text 
            size={80} 
            label={user?.name?.split(' ').map(n => n[0]).join('') || 'U'} 
            style={{ backgroundColor: '#6366f1' }}
          />
          <Title style={styles.userName}>{user?.name}</Title>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Button mode="text" onPress={() => setProfileModal(true)} textColor="#6366f1">Edit Profile</Button>
        </Surface>

        <List.Section>
          <List.Subheader style={{ color: '#94a3b8' }}>Preferences</List.Subheader>
          <List.Item
            title="Currency"
            description={user?.currency || '₹'}
            left={props => <List.Icon {...props} icon="currency-usd" color="#6366f1" />}
            onPress={() => setCurrencyModal(true)}
            style={styles.listItem}
            titleStyle={{ color: '#fff' }}
            right={props => <List.Icon {...props} icon="chevron-right" color="#94a3b8" />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader style={{ color: '#94a3b8' }}>Security</List.Subheader>
          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock" color="#f59e0b" />}
            onPress={() => setPasswordModal(true)}
            style={styles.listItem}
            titleStyle={{ color: '#fff' }}
          />
        </List.Section>

        <List.Section>
          <List.Subheader style={{ color: '#94a3b8' }}>Danger Zone</List.Subheader>
          <List.Item
            title="Reset All Data"
            left={props => <List.Icon {...props} icon="delete-sweep" color="#ef4444" />}
            onPress={handleResetData}
            style={styles.listItem}
            titleStyle={{ color: '#ef4444' }}
          />
        </List.Section>

        <Button 
          mode="contained" 
          onPress={logout} 
          style={styles.logoutBtn}
        >
          Log Out
        </Button>

        {/* Currency Modal */}
        <Portal>
          <Modal visible={currencyModal} onDismiss={() => setCurrencyModal(false)} contentContainerStyle={styles.modalContainer}>
            <Surface style={styles.modalCard}>
              <Title style={styles.modalTitle}>Choose Currency</Title>
              <RadioButton.Group onValueChange={handleCurrencyChange} value={user?.currency || '₹'}>
                {CURRENCIES.map(curr => (
                  <List.Item
                    key={curr.value}
                    title={curr.label}
                    titleStyle={{ color: '#fff' }}
                    onPress={() => handleCurrencyChange(curr.value)}
                    left={() => <RadioButton value={curr.value} color="#6366f1" />}
                  />
                ))}
              </RadioButton.Group>
            </Surface>
          </Modal>

          {/* Profile Modal */}
          <Modal visible={profileModal} onDismiss={() => setProfileModal(false)} contentContainerStyle={styles.modalContainer}>
            <Surface style={styles.modalCard}>
              <Title style={styles.modalTitle}>Edit Profile</Title>
              <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.modalInput} />
              <TextInput label="Email" value={email} onChangeText={setEmail} mode="outlined" style={styles.modalInput} />
              <Button mode="contained" onPress={handleUpdateProfile} loading={loading} style={styles.modalBtn}>Update</Button>
            </Surface>
          </Modal>

          {/* Password Modal */}
          <Modal visible={passwordModal} onDismiss={() => setPasswordModal(false)} contentContainerStyle={styles.modalContainer}>
            <Surface style={styles.modalCard}>
              <Title style={styles.modalTitle}>Change Password</Title>
              <TextInput label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry mode="outlined" style={styles.modalInput} />
              <TextInput label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry mode="outlined" style={styles.modalInput} />
              <Button mode="contained" onPress={handleChangePassword} loading={loading} style={styles.modalBtn}>Update Password</Button>
            </Surface>
          </Modal>
        </Portal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', paddingTop: 60 },
  scrollContent: { padding: 20 },
  profileCard: { padding: 25, borderRadius: 25, backgroundColor: '#1e293b', alignItems: 'center', marginBottom: 15 },
  userName: { color: '#fff', marginTop: 10, fontSize: 22, fontWeight: 'bold' },
  userEmail: { color: '#94a3b8', fontSize: 14, marginBottom: 5 },
  listItem: { backgroundColor: '#1e293b', borderRadius: 15, marginBottom: 8 },
  logoutBtn: { marginTop: 20, backgroundColor: '#ef4444', borderRadius: 15, paddingVertical: 5 },
  modalContainer: { padding: 20 },
  modalCard: { padding: 25, borderRadius: 25, backgroundColor: '#1e293b' },
  modalTitle: { color: '#fff', textAlign: 'center', marginBottom: 20 },
  modalInput: { marginBottom: 15 },
  modalBtn: { marginTop: 10, backgroundColor: '#6366f1' },
});
