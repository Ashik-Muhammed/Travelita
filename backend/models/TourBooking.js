// models/TourBooking.js
const db = require('../config/firebase');

const TourBooking = {
  async create(data) {
    const booking = {
      userId: data.userId,
      packageId: data.packageId,
      status: data.status || 'confirmed',
      bookingDate: new Date(),
      customerName: data.customerName || '',
      customerEmail: data.customerEmail || '',
      customerPhone: data.customerPhone || '',
      price: data.price || 0,
      specialRequests: data.specialRequests || '',
      paymentStatus: data.paymentStatus || 'pending',
      paymentMethod: data.paymentMethod || '',
      paymentId: data.paymentId || '',
      createdAt: new Date()
    };

    const docRef = db.collection('bookings').doc();
    await docRef.set(booking);
    return { id: docRef.id, ...booking };
  },

  async getAll() {
    const snapshot = await db.collection('bookings').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getByUserId(userId) {
    const snapshot = await db.collection('bookings').where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

module.exports = TourBooking;
