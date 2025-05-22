const bcrypt = require('bcrypt');
const db = require('../config/firebase');

const User = {
  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = {
      ...userData,
      password: hashedPassword,
      createdAt: new Date(),
      loginCount: 0
    };
    
    const docRef = await db.collection('users').add(user);
    return { id: docRef.id, ...user };
  },

  async findByEmail(email) {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  },

  async findById(id) {
    const snapshot = await db.collection('users').doc(id).get();
    return snapshot.exists ? snapshot.data() : null;
  },

  async update(id, updates) {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    await db.collection('users').doc(id).update(updates);
    return await this.findById(id);
  },

  async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
};

module.exports = User;