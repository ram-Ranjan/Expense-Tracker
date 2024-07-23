const Sequelize = require("sequelize");

const sequelize = require("../config/database");

const ForgotPasswordRequest = sequelize.define("forgotPasswordRequests", {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  isActive: { type: Sequelize.BOOLEAN, default: false },
});

module.exports = ForgotPasswordRequest;
