const sequelize = require("../config/database");

const Datatypes = require("sequelize");

const User = sequelize.define(
  "user",
  {
    id: {
      type: Datatypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: Datatypes.STRING,
      allowNull: false,
    },
    email: {
      type: Datatypes.STRING,
      allowNull: false,
      // unique: true,
    },
    password: {
      type: Datatypes.STRING,
      allowNull: false,
    },
    totalBalance: {
      type: Datatypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    isPremium: {
      type: Datatypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: false, // This line removes createdAt and updatedAt
  }
);

module.exports = User;
