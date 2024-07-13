const Expense = require('../models/expense');


exports.addExpense = async (req, res) => {
    try {
      const { category, amount, description } = req.body;
  
      console.log('Received expense data:', { category, amount, description });

      const newExpense = await Expense.create({
        category,
        amount,
        description,
      });
  
      console.log('New expense created:', newExpense.toJSON());
  
      res.status(201).json(newExpense);
    } catch (error) {
      console.error('Error adding expense:', error);
      res.status(400).json({ message: error.message, stack: error.stack });
    }
  };
  
  exports.getExpenses = async (req, res) => {
    try {
  
      const expenses = await Expense.findAll({
        order: [['createdAt', 'DESC']]
      });
  
      res.status(200).json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      res.status(500).json({ message: error.message });
    }
  };
  
 
 
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.expenseId);
    if (expense) {
      res.status(200).json(expense);
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { category, amount, description } = req.body;
    const [updated] = await Expense.update(
      { category, amount, description },
      { where: { expenseId: req.params.expenseId } }
    );
    if (updated) {
      const updatedExpense = await Expense.findByPk(req.params.expenseId);
      res.status(200).json(updatedExpense);
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    console.log('Deleting expense with ID:', req.params.expenseId);
    const deleted = await Expense.destroy({ where: { expenseId: req.params.expenseId } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: error.message });
  }
};