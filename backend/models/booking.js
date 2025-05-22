// models/Booking.js
const db = require('../config/firebase');

const Booking = {
  async create(bookingData) {
    const docRef = await db.collection('bookings').add(bookingData);
    return { id: docRef.id, ...bookingData };
  },

  async findById(id) {
    const snapshot = await db.collection('bookings').doc(id).get();
    return snapshot.exists ? snapshot.data() : null;
  },

  async findByUserId(userId) {
    const snapshot = await db.collection('bookings')
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async findByPackageId(packageId) {
    const snapshot = await db.collection('bookings')
      .where('packageId', '==', packageId)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async update(id, updates) {
    await db.collection('bookings').doc(id).update(updates);
    return await this.findById(id);
  },

  async delete(id) {
    await db.collection('bookings').doc(id).delete();
  },

  async findPending() {
    const snapshot = await db.collection('bookings')
      .where('status', '==', 'pending')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

module.exports = Booking;
