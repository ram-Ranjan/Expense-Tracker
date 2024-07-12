const express = require('express');
const sequelize = require('./config/database');

const cors=require('cors');

const app = express();
app.use(cors());

app.use(express.json());

const userRouter=require('./routes/userRoutes');
app.use('/api/user',userRouter);

const port =  3000;
sequelize.
    sync({alter:true})
    .then(() => {
        app.listen(port ,() => {
            console.log(`listening from http://localhost:${port}`);
        })})
    .catch(err => console.log(err));
    




