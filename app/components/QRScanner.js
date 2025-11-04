import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

export default function QRScanner({ onRead, onCancel }) {
  return (
    <View style={styles.container}>
      <QRCodeScanner
        onRead={(e) => onRead && onRead(e.data)}
        flashMode={RNCamera.Constants.FlashMode.auto}
        topContent={<Text style={styles.centerText}>Scan a KasiKoin QR to pay or receive</Text>}
        bottomContent={(
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centerText: { fontSize: 16, color: '#fff', padding: 16, textAlign: 'center' },
  cancelBtn: { padding: 12, backgroundColor: '#fff', borderRadius: 8 },
  cancelText: { color: '#0066cc', fontWeight: '700' }
});
