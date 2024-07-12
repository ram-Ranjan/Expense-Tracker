
const Sequelize = require('sequelize');

const sequelize = new Sequelize('expense_db','root','root@321',{
    dialect:'mysql',
    host:'localhost'
});

module.exports=sequelize;