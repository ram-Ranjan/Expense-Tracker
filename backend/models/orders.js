const DataTypes = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define(
  "order",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    paymentId: DataTypes.STRING,
    orderId: DataTypes.STRING,
    status: DataTypes.STRING,
  },
  {
    timestamps: false, // This line removes createdAt and updatedAt
  }
);

module.exports = Order;
