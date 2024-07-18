const Expense = require('../models/expense');
const User = require('../models/user');



exports.addExpense = async (req, res) => {
    try {
      const { category, amount, description } = req.body;
  
      console.log('Received expense data:', { category, amount, description });



      const newExpense = await Expense.create({
        category,
        amount,
        description,
        userId: req.user.id
      });

      await User.increment('totalExpense', {
        by:parseFloat(amount),
        where: { id: req.user.id }
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
        where: { userId: req.user.id },
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
    const expense = await Expense.findOne({
      where: {
          expenseId: req.params.expenseId,
          userId: req.user.id // Ensure the expense belongs to the authenticated user
      }
  });
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
    const oldExpense = await Expense.findOne({
      where: { expenseId: req.params.expenseId, userId: req.user.id }
  });
  if (!oldExpense) {
    return res.status(404).json({ message: 'Expense not found' });
}
const amountDifference = parseFloat(amount) - oldExpense.amount;

    const [updated] = await Expense.update(
      { category, amount, description },
      { where: { expenseId: req.params.expenseId,
        userId: req.user.id 
       } }
    );
    if (updated) {
      await User.increment('totalExpense', {
        by: amountDifference,
        where: { id: req.user.id }
        });

        const updatedExpense = await Expense.findOne({
          where: { expenseId: req.params.expenseId, userId: req.user.id }
      });

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
    
    const expense = await Expense.findOne({
      where: { expenseId: req.params.expenseId, userId: req.user.id }
  });

  if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
  }
  await expense.destroy();

  await User.decrement('totalExpense', {
      by: expense.amount,
      where: { id: req.user.id }
  });
   
      res.status(204).send();
   
   
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaderBoard = async (req,res) => {
  try{
  //    const leaderboard=await User.findAll({
  //         attributes:['id',
  //             'username',
  //           [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('Expenses.amount')), 0), 'totalExpenses']
  //         ],           
  //         include:[{
  //             model: Expenses,
  //             attributes:[],
  //             required: false
  //         }] ,
  //         group:['User.id'],
  //         order: [[Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('Expenses.amount')), 0), 'DESC']],           
  //         raw:true
  //     });

  const leaderboard = await User.findAll({
      attributes: ['id', 'username', 'totalExpense'],
      order: [['totalExpense', 'DESC']],
      limit: 10 // Adjust as needed
  });
      // console.log(leaderboard)
      const leaderboardWithHighlight = leaderboard.map(entry => ({

          id:entry.id,
          username:entry.username,
          totalExpenses:entry.totalExpense,
          isCurrentUser: entry.id === req.user.id
      }));

      res.json(leaderboardWithHighlight);
    
  }
  catch(error){
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}