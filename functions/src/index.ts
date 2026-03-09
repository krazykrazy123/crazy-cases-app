import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as CryptoJS from "crypto-js";

admin.initializeApp();

const BOT_TOKEN = "8182733820:AAEMxNeN8Oi5U0Un-tP6MzKsRLuixW_hF68";

interface TelegramUserData {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  telegramId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isPremium?: boolean;
  photoUrl?: string;
}

function validateInitData(initData: string): ValidationResult {
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

  let user: TelegramUserData;
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

export const validateTelegramInitData = functions.https.onCall(async (data, context) => {
  const { initData } = data;

  if (!initData) {
    throw new functions.https.HttpsError("invalid-argument", "Missing initData");
  }

  const validation = validateInitData(initData);

  if (!validation.valid) {
    throw new functions.https.HttpsError("unauthenticated", validation.error || "Validation failed");
  }

  const telegramId = validation.telegramId as string;

  const userRef = admin.firestore().collection("users").doc(telegramId);

  await userRef.set(
    {
      telegramId,
      username: validation.username,
      displayName: `${validation.firstName} ${validation.lastName}`.trim(),
      isPremium: validation.isPremium,
      photoUrl: validation.photoUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      balance: admin.firestore.FieldValue.increment(0),
    },
    { merge: true }
  );

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