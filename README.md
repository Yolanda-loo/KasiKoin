# KasiKoin Mobile App

A mobile-first stablecoin platform empowering township creators to receive tips, sell digital goods, and manage payments using the Celo blockchain.

## Prerequisites

1. Node.js (v18+ recommended)
2. npm or yarn
3. React Native development environment:
   - For Android: Android Studio & Android SDK
   - For iOS: Xcode (Mac only)
   - React Native CLI globally installed
4. Java Development Kit (JDK) 11 or newer

## Quick Start

1. Install dependencies:
```bash
# From the project root
npm install

# Install pods for iOS (Mac only)
cd ios && pod install && cd ..
```

2. Start the Thando webhook (required for chat):
```bash
# In a new terminal
node thando/webhook.js
```

3. Start Metro bundler:
```bash
# In a new terminal
npm start
```

4. Run the app:
```bash
# For Android
npm run android

# For iOS (Mac only)
npm run ios
```

## Detailed Setup

### Android Setup

1. Install Android Studio
2. Install Android SDK (minimum API 21)
3. Set up Android environment variables:
   ```bash
   # Add to your .bashrc or .zshrc
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
4. Create an Android Virtual Device (AVD) in Android Studio

### iOS Setup (Mac only)

1. Install Xcode from the Mac App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Install CocoaPods:
   ```bash
   sudo gem install cocoapods
   ```

### Running Different Parts

1. Development server (Metro):
```bash
npm start
```

2. Thando webhook (chat backend):
```bash
node thando/webhook.js
```

3. Android app with live reload:
```bash
npm run android
```

4. iOS app with live reload:
```bash
npm run ios
```

## Common Issues & Solutions

1. Metro bundler port in use:
```bash
# Kill the process using port 8081
lsof -i :8081
kill -9 <PID>
```

2. Android build fails:
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
npm run android
```

3. iOS build fails:
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

4. Webhook connection fails:
- Check WEBHOOK_URL in `app/components/ThandoChat.js`
- Ensure webhook is running (`node thando/webhook.js`)
- For physical devices, use your machine's local IP instead of localhost

## Testing Different Features

1. QR Code Scanner:
- Click "Scan QR" on the main screen
- Test with a KasiKoin payment QR (format: `kasi:0xADDRESS` or `@username`)

2. Chat with Thando:
- Available in English, isiZulu, and Sesotho
- Try commands like:
  - "Create wallet"
  - "Send 10 KASI to Thabo"
  - "Withdraw 50 KASI"

3. Send Tips:
- Use QR scan or manual address entry
- Test different amounts
- Check transaction list updates

## Development Tips

1. Enable Fast Refresh for quick development:
- Shake the device or press ⌘D in simulator
- Select "Enable Fast Refresh"

2. View logs:
```bash
# Android
adb logcat *:S ReactNative:V ReactNativeJS:V

# iOS
xcrun simctl spawn booted log stream --level debug --predicate 'process == "KasiKoin"'
```

3. Debug network issues:
- Open Developer Menu (shake device)
- Select "Debug" -> "Enable Network Inspector"

## Contributing

1. Branch naming:
- Features: `feature/description`
- Fixes: `fix/description`

2. Before committing:
- Run tests: `npm test`
- Check formatting: `npm run lint`

## Next Steps

- [ ] Replace webhook URL with production endpoint
- [ ] Add real Celo contract integration
- [ ] Implement full withdrawal flow
- [ ] Add transaction history pagination
#How to run the code 
"%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" devices
