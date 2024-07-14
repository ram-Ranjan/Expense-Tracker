const express = require('express');
const router = express.Router();

const purchaseController = require('../controllers/purchaseController');
const { authenticateJWT } = require('../middlewares/auth');

router.get('/premium', authenticateJWT, purchaseController.purchasePremium);

router.post('/updateTransactionStatus', authenticateJWT, purchaseController.updateTransactionStatus);

module.exports = router;