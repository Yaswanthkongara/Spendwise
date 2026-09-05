import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Provider as PaperProvider, MD3DarkTheme, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

function TabButton({ name, icon, active, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabButton}>
      <MaterialCommunityIcons 
        name={icon} 
        size={24} 
        color={active ? '#6366f1' : '#94a3b8'} 
      />
      <Text style={[styles.tabLabel, { color: active ? '#6366f1' : '#94a3b8' }]}>{name}</Text>
    </TouchableOpacity>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch (activeTab) {
      case 'Home': return <DashboardScreen />;
      case 'Analytics': return <AnalyticsScreen />;
      case 'Transactions': return <TransactionsScreen />;
      case 'Settings': return <SettingsScreen />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <View style={styles.flexContainer}>
      <View style={styles.contentArea}>
        {renderContent()}
      </View>
      <View style={styles.tabBar}>
        <TabButton name="Home" icon="home" active={activeTab === 'Home'} onPress={() => setActiveTab('Home')} />
        <TabButton name="Analytics" icon="chart-bar" active={activeTab === 'Analytics'} onPress={() => setActiveTab('Analytics')} />
        <TabButton name="Transactions" icon="format-list-bulleted" active={activeTab === 'Transactions'} onPress={() => setActiveTab('Transactions')} />
        <TabButton name="Settings" icon="cog" active={activeTab === 'Settings'} onPress={() => setActiveTab('Settings')} />
      </View>
    </View>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState('Login'); // 'Login' or 'Register'

  if (loading) return <View style={styles.flexContainer} />;
  
  if (!user) {
    return authPage === 'Login' 
      ? <LoginScreen onNavigate={() => setAuthPage('Register')} />
      : <RegisterScreen onNavigate={() => setAuthPage('Login')} />;
  }

  return <MainApp />;
}

export default function App() {
  return (
    <PaperProvider theme={MD3DarkTheme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  flexContainer: { flex: 1, backgroundColor: '#0f172a' },
  contentArea: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 10,
  },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabLabel: { fontSize: 10, marginTop: 4 }
});
