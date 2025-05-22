// models/TourPackage.js
const db = require('../config/firebase');

const TourPackage = {
  async create(packageData) {
    const docRef = await db.collection('packages').add(packageData);
    return { id: docRef.id, ...packageData };
  },

  async findById(id) {
    const snapshot = await db.collection('packages').doc(id).get();
    return snapshot.exists ? snapshot.data() : null;
  },

  async findByDestination(destination) {
    const snapshot = await db.collection('packages')
      .where('destination', '==', destination)
      .where('status', '==', 'approved')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async findFeatured(type) {
    const query = db.collection('packages')
      .where('featured', '==', true)
      .where('available', '==', true)
      .where('status', '==', 'approved');

    let orderBy = 'ratings';
    if (type === 'budget') {
      orderBy = 'price';
    }

    const snapshot = await query.orderBy(orderBy).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async update(id, updates) {
    await db.collection('packages').doc(id).update(updates);
    return await this.findById(id);
  },

  async delete(id) {
    await db.collection('packages').doc(id).delete();
  },

  async findByVendor(vendorId) {
    const snapshot = await db.collection('packages')
      .where('vendorId', '==', vendorId)
      .where('status', '==', 'approved')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async findPending() {
    const snapshot = await db.collection('packages')
      .where('status', '==', 'pending')
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

module.exports = TourPackage;
