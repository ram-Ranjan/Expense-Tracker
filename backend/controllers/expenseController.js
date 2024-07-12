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
  
 
  exports.deleteExpense = async (req, res) => {
    try {
      const { id } = req.params;
  
      const expense = await Expense.findOne({ where: { id } });
  
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
  
      await expense.destroy();
  
      res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  };