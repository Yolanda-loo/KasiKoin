import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

function TxItem({ item }) {
  return (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.to}>{item.to}</Text>
        <Text style={styles.meta}>{item.tx ? item.tx.slice(0, 12) : 'pending'}</Text>
      </View>
      <Text style={styles.amount}>{item.amount} KASI</Text>
    </View>
  );
}

export default function TransactionList({ transactions }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recent transactions</Text>
      <FlatList data={transactions} keyExtractor={(i, idx) => i.tx || String(idx)} renderItem={({ item }) => <TxItem item={item} />} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12, flex: 1 },
  header: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  item: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center' },
  to: { fontSize: 14, fontWeight: '600' },
  meta: { fontSize: 12, color: '#777' },
  amount: { fontSize: 16, fontWeight: '700' }
});
