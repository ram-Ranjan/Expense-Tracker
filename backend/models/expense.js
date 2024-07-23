const sequelize = require("../config/database");

const DataTypes = require("sequelize");

const Expense = sequelize.define(
  "expense",
  {
    expenseId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        "Food",
        "Groceries",
        "Travelling",
        "Fitness",
        "Bill",
        "Income",
        "other"
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    income: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    spending: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
  },
  {
    timestamps: false, // This line removes createdAt and updatedAt
  }
);

module.exports = Expense;
