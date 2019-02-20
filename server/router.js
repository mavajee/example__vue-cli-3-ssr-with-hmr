const path = require('path');
const express = require('express');

const router = express.Router();

// Static
router.use('/public', express.static(path.resolve(__dirname, './../dist/public')));

module.exports = router;
