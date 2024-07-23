const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../config/database");
const s3Services = require('../services/awsS3Services')

exports.addExpense = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { date, category, description, income, spending } = req.body;

    const parsedIncome = parseFloat(income) || 0;
    const parsedSpending = parseFloat(spending) || 0;
    const newExpense = await Expense.create(
      {
        date,
        category,
        description,
        income: parsedIncome,
        spending: parsedSpending,
        userId: req.user.id,
      },
      { transaction }
    );
    console.log(newExpense);
    const balanceChange = parsedIncome - parsedSpending;
    await User.increment("totalBalance", {
      by: balanceChange,
      where: { id: req.user.id },
      transaction,
    });

    await transaction.commit();
    res.status(201).json(newExpense);
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(400).json({ message: error.message, stack: error.stack });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      order: [["date", "DESC"]],
    });

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: {
        expenseId: req.params.expenseId,
        userId: req.user.id, // Ensure the expense belongs to the authenticated user
      },
    });
    if (expense) {
      res.status(200).json(expense);
    } else {
      res.status(404).json({ message: "Expense not found" });
    }
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateExpense = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { date, category, description, income, spending } = req.body;

    const parsedIncome = parseFloat(income) || 0;
    const parsedSpending = parseFloat(spending) || 0;

    const oldExpense = await Expense.findOne({
      where: { expenseId: req.params.expenseId, userId: req.user.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!oldExpense) {
      throw new Error("Expense not found");
    }
    const balanceChange =
      parsedIncome - parsedSpending - (oldExpense.income - oldExpense.spending);

    const [updatedExpense] = await Promise.all([
      Expense.update(
        {
          date,
          category,
          description,
          income: parsedIncome,
          spending: parsedSpending,
        },
        {
          where: { expenseId: req.params.expenseId, userId: req.user.id },
          transaction,
          returning: true,
        }
      ),
      User.increment("totalBalance", {
        by: balanceChange,
        where: { id: req.user.id },
        transaction,
      }),
    ]);
    await transaction.commit();
    res.status(200).json(updatedExpense[0]);
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating expense:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log("Deleting expense with ID:", req.params.expenseId);

    const expense = await Expense.findOne({
      where: { expenseId: req.params.expenseId, userId: req.user.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const balanceChange = expense.spending - expense.income;

    if (!expense) {
      throw new Error("Expense not found");
    }
    await Promise.all([
      expense.destroy({ transaction }),
      User.increment("totalBalance", {
        by: balanceChange,
        where: { id: req.user.id },
        transaction,
      }),
    ]);
    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

exports.getLeaderBoard = async (req, res) => {
  try {
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
      attributes: ["id", "username", "totalBalance"],
      order: [["totalBalance", "DESC"]],
      limit: 10,
    });
    // console.log(leaderboard)
    const leaderboardWithHighlight = leaderboard.map((entry) => ({
      id: entry.id,
      username: entry.username,
      totalBalance: entry.totalBalance,
      isCurrentUser: entry.id === req.user.id,
    }));

    res.json(leaderboardWithHighlight);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};



