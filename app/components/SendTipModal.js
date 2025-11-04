import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, Alert } from 'react-native';

export default function SendTipModal({ visible, onClose, prefillRecipient, onSent }) {
  const [recipient, setRecipient] = useState(prefillRecipient || '');
  const [amount, setAmount] = useState('1');
  const [loading, setLoading] = useState(false);

  // Reset when prefill changes
  React.useEffect(() => {
    setRecipient(prefillRecipient || '');
  }, [prefillRecipient]);

  async function sendTip() {
    if (!recipient || !amount) {
      Alert.alert('Validation', 'Please enter recipient and amount');
      return;
    }
    setLoading(true);
    try {
      // Call your backend endpoint for sending tips. Replace URL with your backend.
      const res = await fetch('http://localhost:3000/tx/tip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, amount })
      });
      const json = await res.json();
      setLoading(false);
      if (json && json.success) {
        onSent && onSent({ to: recipient, amount, tx: json.tx || '0xFAKE' });
        onClose();
      } else {
        Alert.alert('Error', json.error || 'Failed to send tip');
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Network', 'Could not reach backend');
      console.warn('sendTip error', err.message);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Send Tip</Text>

          <Text style={styles.label}>Recipient (address or username)</Text>
          <TextInput value={recipient} onChangeText={setRecipient} style={styles.input} placeholder="0x... or @username" />

          <Text style={styles.label}>Amount (KASI)</Text>
          <TextInput value={amount} onChangeText={setAmount} style={styles.input} keyboardType="numeric" />

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.sendBtn]} onPress={sendTip} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Send</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '90%', padding: 16, backgroundColor: '#fff', borderRadius: 12 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 12, color: '#444', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginTop: 6 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  btn: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 6, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#eee' },
  cancelText: { color: '#333', fontWeight: '700' },
  sendBtn: { backgroundColor: '#0066cc' },
  sendText: { color: '#fff', fontWeight: '700' }
});
