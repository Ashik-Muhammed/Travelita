const admin = require('firebase-admin');
const serviceAccount = require('../travelita-be5ad-firebase-adminsdk-fbsvc-5b3cb1e058.json'); // Import service account JSON

// Initialize Firebase Admin SDK with the service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Firestore reference

module.exports = db;
