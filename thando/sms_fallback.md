# SMS Fallback Design for Thando

Goal: allow low-data or non-smartphone users to use KasiKoin features via SMS. The Dialogflow voice/chat agent should fallback to SMS when user's device or channel doesn't support rich interactions.

Overview:
- Trigger: A user without a connected messaging client or who asks explicitly for SMS backup.
- Mechanism: When the webhook detects `originalDetectIntentRequest.source` or a missing webchat payload, it returns a short response and triggers an outgoing SMS to the user's phone using Twilio (or another SMS provider).
- Security: Use a short, one-time code (6 digits) for confirmation during withdrawals or agent pickups. Never include private keys or full addresses in SMS—only short prefixes and OTB codes.

Flows:

1) Wallet backup via SMS
- User: "Send SMS backup to +27xxxxxxxxx" (Dialogflow param: phone_number)
- Webhook action: create wallet or fetch public address; send SMS with: "KasiKoin wallet 'Lerato' ready. Addr: 0xDEAD...BEEF. Backup code: 123456. Keep safe."
- SMS opt-in: ensure the user confirmed consent and store consent flag server-side.

2) Tip confirmation via SMS
- If the user requests a tip but the webhook sees low-bandwidth channel, send SMS receipt: "You sent 10 KASI to Thabo. Tx: 0xFAKETX. Reply YES to save as template."  
- For actions that require confirmation (withdrawals), send OTB codes and require the user to present the code to the agent.

3) Withdrawal / Agent pickup
- Webhook creates a withdrawal request with a local agent partner, stores a record with OTB code and expiry (e.g., 30 minutes).
- SMS sent to user: "Withdrawal 50 KASI ready. Code: 842391. Bring ID to agent at 123 Main Street. Expires in 30m."  
- Agent UI (separate) enters code and confirms; backend marks withdrawal completed and releases fiat.

Implementation notes:
- Use Twilio or an SMS gateway with delivery receipts; track status for retries.
- Keep SMS content short (<160 chars) and available in local languages (isiZulu, Sesotho, English).
- Respect opt-in and local regulations for transactional SMS.

Example messages (EN / ZU):
- EN: "KasiKoin: Wallet 'Lerato' ready. Addr: 0xDEAD...BEEF. Backup code: 123456. Visit agent to cash out."
- ZU: "KasiKoin: I-wallet 'Lerato' isilungile. Ikheli: 0xDEAD...BEEF. Ikhodi yokusekelwa: 123456. Vakashela i-ejenti ukuze ukhiphe imali."

Testing locally:
- Use ngrok to expose webhook; set TWILIO_SID and TWILIO_TOKEN for real SMS, or stub Twilio in dev.
- Log SMS bodies to file in staging to prevent accidental SMS spam during dev.

Privacy & safety:
- Never send private keys or full seed phrases over SMS.
- Use short public address prefixes only and rely on in-app deep link or QR for full on-device presentation.
