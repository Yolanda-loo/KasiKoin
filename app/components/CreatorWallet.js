import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import ThandoChat from './ThandoChat';
import QRScanner from './QRScanner';
import SendTipModal from './SendTipModal';
import TransactionList from './TransactionList';

export default function CreatorWallet() {
  const [balance, setBalance] = useState('0.00');
  const [showQR, setShowQR] = useState(false);
  const [showSendTip, setShowSendTip] = useState(false);
  const [prefillRecipient, setPrefillRecipient] = useState('');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // TODO: Replace with real on-chain balance fetch via @celo/react-celo or ethers
    setBalance('125.00');

    // Load recent transactions (stubbed)
    setTransactions([
      { to: 'Thabo', amount: '5', tx: '0xabc123' },
      { to: 'MzansiGallery', amount: '20', tx: '0xdef456' }
    ]);
  }, []);

  function onScanQR() {
    setShowQR(true);
  }

  function onWithdraw() {
    Alert.alert('Withdraw', 'Open withdraw flow (stub)');
  }

  function handleQRRead(data) {
    // Expect QR payload like 'kasi:0xADDRESS' or '@username'
    setShowQR(false);
    setPrefillRecipient(data);
    setShowSendTip(true);
  }

  function handleSendSent(record) {
    // record: { to, amount, tx }
    setTransactions(prev => [record, ...prev]);
    // Update balance locally (demo)
    const newBal = (parseFloat(balance) - parseFloat(record.amount)).toFixed(2);
    setBalance(newBal);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KasiKoin</Text>
        <Text style={styles.subtitle}>Creator Wallet</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceAmount}>{balance} KASI</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onScanQR}>
          <Text style={styles.actionText}>Scan QR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSendTip(true)}>
          <Text style={styles.actionText}>Send Tip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onWithdraw}>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <TransactionList transactions={transactions} />

      <View style={styles.chatContainer}>
        <Text style={styles.chatHeader}>Thando — your assistant</Text>
        <ThandoChat />
      </View>

      <Modal visible={showQR} animationType="slide">
        <QRScanner onRead={handleQRRead} onCancel={() => setShowQR(false)} />
      </Modal>

      <SendTipModal visible={showSendTip} onClose={() => setShowSendTip(false)} prefillRecipient={prefillRecipient} onSent={handleSendSent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, color: '#666' },
  balanceCard: { padding: 16, borderRadius: 8, backgroundColor: '#f6f8fb', marginVertical: 12 },
  balanceLabel: { fontSize: 12, color: '#444' },
  balanceAmount: { fontSize: 28, fontWeight: '700', marginTop: 6 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 },
  actionBtn: { flex: 1, padding: 12, backgroundColor: '#0066cc', borderRadius: 8, marginHorizontal: 6 },
  actionText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  chatContainer: { flex: 1, marginTop: 8 },
  chatHeader: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
});
