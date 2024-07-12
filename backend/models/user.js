
const sequelize = require('../config/database');

const  Datatypes  = require('sequelize');

const User = sequelize.define('user',{
    id:{
        type : Datatypes.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    username:{
        type:Datatypes.STRING,
        allowNull:false

    },
    email:{
        type:Datatypes.STRING,
        allowNull:false,
        unique:true,
        validate: {
            isEmail: true
          }
    },
    password:{
        type:Datatypes.STRING,
        allowNull:false
    }
})

module.exports=User;