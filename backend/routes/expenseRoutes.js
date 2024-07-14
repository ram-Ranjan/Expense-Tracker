const express= require('express');
const router = express.Router();

const expenseController = require('../controllers/expenseController');
const { authenticateJWT } = require('../middlewares/auth');

router.post('/', authenticateJWT, expenseController.addExpense);
router.get('/', authenticateJWT, expenseController.getExpenses);
router.get('/:expenseId', authenticateJWT, expenseController.getExpense);
router.put('/:expenseId', authenticateJWT, expenseController.updateExpense);
router.delete('/:expenseId', authenticateJWT, expenseController.deleteExpense);

module.exports=router;