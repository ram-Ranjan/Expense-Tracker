require('dotenv').config();

const express = require('express');
const sequelize = require('./config/database');

const cors=require('cors');

const app = express();
app.use(cors());

app.use(express.json());

const userRouter=require('./routes/userRoutes');
app.use('/api/user',userRouter);

const expenseRouter = require('./routes/expenseRoutes');
app.use('/api/expense',expenseRouter);

 const User = require('./models/user');
 const Expense = require('./models/expense')

 const purchaseRouter = require('./routes/purchaseRoutes');
app.use('/api/purchase',purchaseRouter);

const Order = require('./models/orders');

 User.hasMany(Expense);
 Expense.belongsTo(User);

 User.hasMany(Order);
 Order.belongsTo(User)

const port =  3000;
sequelize.
    sync({alter:true})
    .then(() => {
        app.listen(port ,() => {
            console.log(`listening from http://localhost:${port}`);
        })})
    .catch(err => console.log(err));
    




