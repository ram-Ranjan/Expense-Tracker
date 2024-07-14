const DataTypes = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('order',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    paymentId:DataTypes.STRING,
    orderId:DataTypes.STRING,
    status:DataTypes.STRING

}
)

module.exports = Order;