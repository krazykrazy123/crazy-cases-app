const functions = require("firebase-functions");
const admin = require("firebase-admin");
const CryptoJS = require("crypto-js");
const { Telegraf } = require("telegraf");

admin.initializeApp();

const BOT_TOKEN = "8182733820:AAE7j5p6tgDJ8DVDn5ieJ9WBKVWE0R8Wz7g";

// ==================== YOUR EXISTING AUTH FUNCTION ====================
function validateInitData(initData) {
  if (!initData) return { valid: false, error: "No initData" };

  const dataCheckString = initData
    .split("&")
    .filter((kv) => !kv.startsWith("hash="))
    .sort()
    .join("\n");

  const secretKey = CryptoJS.HmacSHA256(BOT_TOKEN, "WebAppData");
  const calculatedHash = CryptoJS.HmacSHA256(dataCheckString, secretKey).toString(CryptoJS.enc.Hex);

  const receivedHash = initData.split("hash=")[1];

  if (calculatedHash !== receivedHash) {
    return { valid: false, error: "Invalid hash" };
  }

  const userRaw = initData.split("&").find((kv) => kv.startsWith("user="));
  if (!userRaw) return { valid: false, error: "No user field" };

  let user;
  try {
    user = JSON.parse(decodeURIComponent(userRaw.split("=")[1]));
  } catch {
    return { valid: false, error: "Invalid user JSON" };
  }

  return {
    valid: true,
    telegramId: String(user.id),
    username: user.username || `user_${user.id}`,
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    isPremium: !!user.is_premium,
    photoUrl: user.photo_url || "",
  };
}

exports.validateTelegramInitData = functions.https.onCall(async (data) => {
  const { initData } = data;

  if (!initData) {
    throw new functions.https.HttpsError("invalid-argument", "Missing initData");
  }

  const validation = validateInitData(initData);

  if (!validation.valid) {
    throw new functions.https.HttpsError("unauthenticated", validation.error || "Validation failed");
  }

  const telegramId = validation.telegramId;

  const userRef = admin.firestore().collection("users").doc(telegramId);

  await userRef.set({
    telegramId,
    username: validation.username,
    displayName: `${validation.firstName} ${validation.lastName}`.trim(),
    isPremium: validation.isPremium,
    photoUrl: validation.photoUrl,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    balanceTON: admin.firestore.FieldValue.increment(0),
    balanceSTARS: admin.firestore.FieldValue.increment(0),
  }, { merge: true });

  const customToken = await admin.auth().createCustomToken(telegramId);

  return {
    success: true,
    customToken,
    telegramUser: {
      id: telegramId,
      username: validation.username,
      firstName: validation.firstName,
      lastName: validation.lastName,
      isPremium: validation.isPremium,
      photoUrl: validation.photoUrl,
    },
  };
});

// ==================== CREATE INVOICE (Stars + TON) ====================
exports.createInvoice = functions.https.onCall(async (data, context) => {
  console.log('createInvoice called with data:', JSON.stringify(data)); // ← LOGS INCOMING DATA

  const { userId, username, currency = 'STARS', amount } = data || {};

  if (!userId) {
    console.error('Missing userId');
    throw new functions.https.HttpsError('invalid-argument', 'Missing userId');
  }

  const parsedAmount = Number(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    console.error('Invalid amount:', amount);
    throw new functions.https.HttpsError('invalid-argument', 'Amount must be positive number');
  }

  if (!currency || (currency !== 'STARS' && currency !== 'TON')) {
    console.error('Invalid currency:', currency);
    throw new functions.https.HttpsError('invalid-argument', 'Currency must be STARS or TON');
  }

  let title, description, payload, currencyCode, prices;

  if (currency === 'STARS') {
    title = `Deposit ${parsedAmount} Stars`;
    description = `Add ${parsedAmount} Stars to your Crazy Cases balance`;
    payload = JSON.stringify({ userId, amount: parsedAmount, currency: 'STARS' });
    currencyCode = 'XTR';
    prices = [{ label: 'Deposit', amount: parsedAmount }];
  } else if (currency === 'TON') {
    title = `Deposit ${parsedAmount} TON`;
    description = `Add ${parsedAmount} TON to your Crazy Cases balance`;
    payload = JSON.stringify({ userId, amount: parsedAmount, currency: 'TON' });
    currencyCode = 'TON';
    prices = [{ label: 'Deposit', amount: parsedAmount * 1000000000 }];
  }

  const bot = new Telegraf(BOT_TOKEN);

  try {
    const invoiceLink = await bot.telegram.createInvoiceLink({
      title,
      description,
      payload,
      provider_token: '',
      currency: currencyCode,
      prices,
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false
    });

    console.log('Invoice created successfully:', invoiceLink);
    return { success: true, invoiceLink };
  } catch (err) {
    console.error('Invoice creation failed:', err.message);
    throw new functions.https.HttpsError('internal', 'Failed to create invoice: ' + err.message);
  }
});