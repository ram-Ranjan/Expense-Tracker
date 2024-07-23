const Sequelize = require("sequelize");

const sequelize = require("../config/database");

const ReportHistory = sequelize.define("reportHistory", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fileUrl: { type: Sequelize.TEXT, 
    allowNull:false
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports = ReportHistory;
