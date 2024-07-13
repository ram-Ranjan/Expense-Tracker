const express= require('express');
const router = express.Router();

const expenseController = require('../controllers/expenseController');


router.post('/',expenseController.addExpense);
router.get('/', expenseController.getExpenses);

router.get('/:expenseId', expenseController.getExpense);
router.put('/:expenseId', expenseController.updateExpense);
router.delete('/:expenseId', expenseController.deleteExpense);;

module.exports=router;