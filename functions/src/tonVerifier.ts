export const verifyTonPayment = functions.https.onCall(async (data, context) => {
  // ... verify transaction on TON blockchain (use @ton/ton)
  // if valid → update user balance
  await db.collection('users').doc(data.userId).update({
    balanceTON: admin.firestore.FieldValue.increment(data.amount)
  });
});