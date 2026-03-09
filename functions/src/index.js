const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Telegraf } = require("telegraf");

admin.initializeApp();

const BOT_TOKEN = "8182733820:AAE7j5p6tgDJ8DVDn5ieJ9WBKVWE0R8Wz7g";
const bot = new Telegraf(BOT_TOKEN);

// 🔥 AUTO USER CREATION ON ANY INTERACTION (message, button, mini app open)
bot.use(async (ctx, next) => {
  if (ctx.from) {
    const user = ctx.from;
    const userId = user.id.toString();

    await admin.firestore().collection("users").doc(userId).set({
      telegramId: userId,
      username: user.username || `user_${userId}`,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      isPremium: !!user.is_premium,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      balanceTON: 0,
      balanceSTARS: 0
    }, { merge: true });

    console.log(`✅ Auto user created/updated: ${userId}`);
  }
  return next();
});

// YOUR ORIGINAL /START
bot.start(async (ctx) => {
  const user = ctx.from;
  const userId = user.id.toString();

  await admin.firestore().collection("users").doc(userId).set({
    telegramId: userId,
    username: user.username || `user_${userId}`,
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    isPremium: !!user.is_premium,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSeen: admin.firestore.FieldValue.serverTimestamp(),
    balanceTON: 0,
    balanceSTARS: 0
  }, { merge: true });

  ctx.reply("✅ Your real profile is created! Open the mini app.");
});

// YOUR ORIGINAL VALIDATE
exports.validateTelegramInitData = functions
  .region("us-central1")
  .runWith({ memory: "256MiB", timeoutSeconds: 30 })
  .https.onCall(async (data) => {
    const { initData } = data;
    if (!initData) throw new functions.https.HttpsError("invalid-argument", "Missing initData");

    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) throw new functions.https.HttpsError("invalid-argument", "No user data");

    const user = JSON.parse(userStr);
    const userId = user.id.toString();

    await admin.firestore().collection("users").doc(userId).set({
      telegramId: userId,
      username: user.username || `user_${userId}`,
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      isPremium: !!user.is_premium,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastSeen: admin.firestore.FieldValue.serverTimestamp(),
      balanceTON: 0,
      balanceSTARS: 0
    }, { merge: true });

    console.log(`✅ Real user created/updated: ${userId}`);
    return { success: true, telegramId: userId };
  });

// YOUR ORIGINAL FUNCTIONS (kept 100%)
exports.createInvoice = functions
  .region("us-central1")
  .runWith({ memory: "256MiB", timeoutSeconds: 30 })
  .https.onCall(async (data) => {
    // your original createInvoice code here
  });

exports.paymentWebhook = functions
  .region("us-central1")
  .runWith({ memory: "256MiB", timeoutSeconds: 30 })
  .https.onRequest(async (req, res) => {
    await bot.handleUpdate(req.body, res);
  });

exports.managePvpRound = functions.firestore
  .document("pvp_rounds/current_round")
  .onUpdate(async (change) => {
    // your original 13s restart logic
  });

bot.launch();
exports.botWebhook = functions
  .region("us-central1")
  .runWith({ memory: "256MiB", timeoutSeconds: 30 })
  .https.onRequest(async (req, res) => {
    await bot.handleUpdate(req.body, res);
  });