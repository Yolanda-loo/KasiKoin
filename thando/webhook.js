/*
 Thando Dialogflow webhook stub
 - Node/Express server to handle Dialogflow fulfillment webhook v2
 - Supports multilingual (languageCode from Dialogflow): en, zu, nso (Sesotho/Northern Sotho)
 - Placeholder integrations for on-chain calls (ethers.js), SMS via Twilio, and simple session handling

 Usage:
 1. npm install express body-parser axios dotenv twilio
 2. set environment variables (PORT, TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM, KASI_API_URL or keys)
 3. ngrok/http(s) endpoint -> Dialogflow fulfillment
*/

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

// Optional: Twilio for SMS fallback
let twilioClient = null;
if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
  const twilio = require('twilio');
  twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
}

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Simple i18n responses
const RESPONSES = {
  welcome: {
    en: "Hi — I'm Thando, your KasiKoin assistant. I can help you set up a wallet, send tips, and withdraw. What would you like to do?",
    zu: "Sawubona — nginguThando, umsizi wakho weKasiKoin. Ngingakusiza ukusetha i-wallet, ukuthumela amathiphu, nokuhoxisa. Ungathanda ukwenzani?",
    nso: "Dumela — ke Thando, mosadi wa KasiKoin. Nka go thuša go hloma wallet, romela tip, goba go kgaogana. O ka rata go dira eng?"
  },
  ask_wallet_name: {
    en: "Please tell me a name for your wallet (e.g., 'Lerato Wallet').",
    zu: "Ngicela ungitshele igama le-wallet yakho (isb., 'Lerato Wallet').",
    nso: "Ke kopa o mpolelele leina la wallet ya gago (mohl., 'Lerato Wallet')."
  },
  confirm_wallet_created: {
    en: "Great — your wallet '{name}' is ready. Your address starts with {addr}. Would you like to get a QR code or an SMS backup?",
    zu: "Kuhle — i-wallet yakho '{name}' isilungile. Ikheli lakho liqala ngo {addr}. Ungathanda ikhowudi ye-QR noma i-SMS yokusekelwa?",
    nso: "Gorebotse — wallet ya gago '{name}' e lokile. Aterese ya gago e thoma ka {addr}. O ka rata QR code goba SMS backup?"
  },
  tip_sent: {
    en: "Tip sent ✓ — {amount} KASI to {creator}. Transaction ID: {tx}. Would you like to save this as a template?",
    zu: "Ithiphu ithunyelwe ✓ — {amount} KASI ku-{creator}. I-ID yokuthengiselana: {tx}. Ungathanda ukuyigcina njengesifanekiso?",
    nso: "Tip e rometswe ✓ — {amount} KASI go {creator}. Transaction ID: {tx}. O ka rata go e boloka bjalo ka template?"
  },
  insufficient_balance: {
    en: "It looks like your balance is too low for that action. You can top up at an agent or request a smaller amount.",
    zu: "Kubukeka sengathi ibhalansi yakho iphansi kakhulu kulo msebenzi. Ungayigcwalisa ku-ejenti noma ucela inani elincane.",
    nso: "Go bonagala gore balance ya gago e seenyenyane bakeng sa tiro yeo. O ka e tlatsa go agent goba o kgope palo ye nnyane."
  },
  fallback: {
    en: "Sorry, I didn't catch that. You can ask me: set up wallet, send tip, withdraw, or create escrow.",
    zu: "Uxolo, angizwa kahle. Ungangibuza: ukusetha i-wallet, ukuthumela ithiphu, ukukhipha, noma ukudala i-escrow.",
    nso: "Nka tshwanelwa, ga ke kwešiše gabotse. O ka mpotša: hloma wallet, romela tip, hweletsa, goba hloma escrow."
  }
};

// Helper to pick language
function langFor(code) {
  if (!code) return 'en';
  if (code.startsWith('zu')) return 'zu';
  if (code.startsWith('nso') || code.startsWith('se') || code.startsWith('st')) return 'nso';
  return 'en';
}

// Placeholder: function that would call your backend to create wallet, send txs, etc.
async function callKasiBackend(action, payload) {
  // Example: POST to your backend API which in turn talks to the blockchain
  if (!process.env.KASI_API_URL) {
    // Return a fake response for local dev
    return {
      success: true,
      address: '0xDEADBEEF',
      tx: '0xFAKETX123',
      message: 'simulated response'
    };
  }
  const url = `${process.env.KASI_API_URL}/${action}`;
  try {
    const res = await axios.post(url, payload, { timeout: 5000 });
    return res.data;
  } catch (err) {
    console.error('Kasi backend error', err.message);
    return { success: false, error: err.message };
  }
}

// Dialogflow webhook handler (v2)
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    const intent = body.queryResult.intent.displayName;
    const languageCode = body.queryResult.languageCode || 'en';
    const lang = langFor(languageCode);
    const params = body.queryResult.parameters || {};

    console.log(`Intent: ${intent}, lang: ${languageCode}, params:`, params);

    let replyText = RESPONSES.fallback[lang];
    let outputContexts = [];

    if (intent === 'Default Welcome Intent' || intent === 'Thando.welcome') {
      replyText = RESPONSES.welcome[lang];
    } else if (intent === 'Wallet.Setup') {
      // Expect param.wallet_name
      const name = params.wallet_name || 'My Kasi Wallet';
      // Call backend to create wallet
      const result = await callKasiBackend('wallet/create', { name, user: body.session });
      if (result.success) {
        const addr = result.address || '0xDEADBEEF';
        replyText = RESPONSES.confirm_wallet_created[lang]
          .replace('{name}', name)
          .replace('{addr}', addr.slice(0, 8));
      } else {
        replyText = "Sorry — couldn't create wallet right now. Try again later.";
      }
    } else if (intent === 'Send.Tip') {
      // Expect params: creator_name, amount
      const creator = params.creator || params.creator_name || 'Creator';
      const amount = params.amount ? params.amount.amount || params.amount : params.amount || '1';

      // Call backend to send tip (simulate)
      const result = await callKasiBackend('tx/tip', { to: creator, amount });
      if (result.success) {
        replyText = RESPONSES.tip_sent[lang]
          .replace('{amount}', amount)
          .replace('{creator}', creator)
          .replace('{tx}', result.tx || '0xFAKETX');

        // Optionally send SMS receipt if phone present in session params
        const phone = params.phone_number || (body.originalDetectIntentRequest && body.originalDetectIntentRequest.payload && body.originalDetectIntentRequest.payload.phoneNumber);
        if (phone && twilioClient) {
          const sms = `${amount} KASI sent to ${creator}. Tx ${result.tx}`;
          try {
            await twilioClient.messages.create({ body: sms, from: process.env.TWILIO_FROM, to: phone });
          } catch (e) {
            console.warn('Twilio send failed', e.message);
          }
        }
      } else {
        replyText = RESPONSES.insufficient_balance[lang];
      }
    } else if (intent === 'Withdraw.Request') {
      const amount = params.amount ? params.amount.amount || params.amount : params.amount || 0;
      // For withdrawals, send a confirmation flow
      // Save intent state in outputContexts for follow-up confirmation (example)
      outputContexts.push({
        name: `${body.session}/contexts/withdraw-followup`,
        lifespanCount: 2,
        parameters: { amount }
      });
      replyText = `You asked to withdraw ${amount} KASI. Please confirm by replying 'yes' or 'confirm'.`;
    } else if (intent === 'Withdraw.Confirm') {
      // Read amount from context
      const ctx = (body.queryResult.outputContexts || []).find(c => c.name && c.name.endsWith('/withdraw-followup'));
      const amount = ctx && ctx.parameters && ctx.parameters.amount ? ctx.parameters.amount : 'unknown';
      // Call backend to queue withdrawal (off-chain agent flow)
      const result = await callKasiBackend('withdraw/request', { amount, user: body.session });
      if (result.success) {
        replyText = `Withdrawal requested: ${amount} KASI. Agent code: ${result.agentCode || 'AGENT123'}. We'll SMS instructions.`;
        if (twilioClient && result.smsPhone) {
          try {
            await twilioClient.messages.create({ body: `Your withdrawal ${amount} KASI is ready. Code: ${result.agentCode || 'AGENT123'}`, from: process.env.TWILIO_FROM, to: result.smsPhone });
          } catch (e) {
            console.warn('Twilio send failed', e.message);
          }
        }
      } else {
        replyText = `Couldn't schedule withdrawal: ${result.error || 'try again later'}`;
      }
    }

    res.json({
      fulfillmentText: replyText,
      outputContexts
    });
  } catch (err) {
    console.error('Webhook error', err);
    res.json({ fulfillmentText: 'Internal error — please try again later.' });
  }
});

app.get('/', (req, res) => res.send('Thando webhook running'));

app.listen(PORT, () => console.log(`Thando webhook listening on port ${PORT}`));
