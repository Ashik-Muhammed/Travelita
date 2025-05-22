require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user'); // Fixed case sensitivity issue

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tour-packages'; 