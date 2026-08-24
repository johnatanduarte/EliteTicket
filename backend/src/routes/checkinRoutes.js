const express = require('express');
const checkinController = require('../controllers/checkinController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/validate', authenticate, authorize('STAFF'), checkinController.validate);

module.exports = router;