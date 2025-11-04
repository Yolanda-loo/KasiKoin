# Thando — Multilingual sample dialogues (English, isiZulu, Sesotho/Northern Sotho)

These sample dialogues are ready to be copy-pasted into Dialogflow training phrases and responses. Use the intent names suggested in parentheses.

## Wallet setup (Intent: Wallet.Setup)
- EN (user): "Create a wallet called Lerato Wallet"
- EN (agent): "Great — your wallet 'Lerato Wallet' is ready. Your address starts with 0xDEADBEEF. Would you like a QR code or an SMS backup?"

- ZU (user): "Ngisize ngisete i-wallet, igama layo uLerato Wallet"
- ZU (agent): "Kuhle — i-wallet yakho 'Lerato Wallet' isilungile. Ikheli lakho liqala ngo 0xDEADBEEF. Ungathanda ikhowudi ye-QR noma i-SMS yokusekelwa?"

- NSO/SE (user): "Nka hloma wallet ya ka, leina ke Lerato Wallet"
- NSO/SE (agent): "Gorebotse — wallet ya gago 'Lerato Wallet' e lokile. Aterese ya gago e thoma ka 0xDEADBEEF. O ka rata QR code goba SMS backup?"

## Send tip (Intent: Send.Tip)
- EN (user): "Send R10 to Thabo" / training: "Tip Thabo 10 rand" / "Send a tip to @Thabo"
- EN (agent success): "Tip sent ✓ — 10 KASI to Thabo. Transaction ID: 0xFAKETX123. Would you like to save this as a template?"

- ZU (user): "Thumela uThabo ama-R10"  
- ZU (agent): "Ithiphu ithunyelwe ✓ — 10 KASI ku-Thabo. I-ID yokuthengiselana: 0xFAKETX123. Ungathanda ukuyigcina njengesifanekiso?"

- NSO (user): "Romela Thabo 10 rand"  
- NSO (agent): "Tip e rometswe ✓ — 10 KASI go Thabo. Transaction ID: 0xFAKETX123. O ka rata go e boloka bjalo ka template?"

## Withdraw flow (Intent: Withdraw.Request -> Withdraw.Confirm)
- EN: "Withdraw 50 KASI" -> Thando asks: "You asked to withdraw 50 KASI. Please confirm by replying 'yes' or 'confirm'."
- ZU: "Ngifuna ukukhipha 50 KASI" -> confirmation in isiZulu
- NSO: "Ke kopa hweletsa 50 KASI" -> confirmation in Sesotho

## Escrow / milestones (Intent: Escrow.Create)
- EN: "Create escrow for Thabo — 200 KASI — 4 milestones"  
- Follow-ups: "Mark milestone 1 complete" (Intent: Escrow.MilestoneComplete)

## Fallback / help
- EN: "Help" -> "You can ask me: set up wallet, send tip, withdraw, or create escrow."
- ZU / NSO equivalents included in the RESPONSES object in the webhook

## Voice prompts (short)
- EN: "Say: Send ten Kasi to Thabo"  
- ZU: "Sho: Thumela amathiphu angu-10 kuThabo"  
- NSO: "Bolela: Romela Thabo 10 Kasi"


Tips for Dialogflow agent setup:
- Create intents: `Thando.welcome`, `Wallet.Setup`, `Send.Tip`, `Withdraw.Request`, `Withdraw.Confirm`, `Escrow.Create`, `Escrow.MilestoneComplete`, `Default Fallback Intent`.
- Use `languageCode` detection; the webhook uses it to choose replies.
- Add parameters: `wallet_name` (text), `creator`/`creator_name` (text), `amount` (Google.Number or custom currency), `phone_number` (phone)
- Enable webhook fulfillment for these intents and point to `/webhook` deployed URL (ngrok for local dev)
