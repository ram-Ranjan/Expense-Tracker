const sequelize = require('../config/database')

const DataTypes = require('sequelize');

const Expense = sequelize.define('expense',{
    expenseId:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    category: {
        type: DataTypes.ENUM('Food', 'Groceries', 'Travelling', 'Fitness', 'Entertainment'),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
    description:{
        type:DataTypes.STRING,
        allowNull:false
    }
})

module.exports=Expense;