const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  console.log('--- [DIRECT-TEST] Route accessed! ---');
  res.json({ message: 'Direct test route is working!' });
});

module.exports = router; 