
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Sequelize  = require('sequelize');
const Expenses = require('../models/expense');
const sequelize = require('../config/database')

const Sib = require('sib-api-v3-sdk');





exports.signupUser =async (req,res,next) =>{
    const transaction = await sequelize.transaction()
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword =await bcrypt.hash(password, 10); 

        const newUser = await User.create({ username, email, password: hashedPassword},transaction);
        console.log('User Signed Up');
      await  transaction.commit();
        res.status(201).json({ message: 'User created successfully', userId: newUser.id });
          }
    catch{
       await transaction.rollback();
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Server error' });
 
    }
};

exports.loginUser = async (req,res) => {
    try{
        const {email,password} = req.body;
        const existingUser = await User.findOne({ where: {email}});
        if (!existingUser || !await bcrypt.compare(password, existingUser.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }

        
            const token = jwt.sign(
                { id: existingUser.id, 
                    email: existingUser.email ,
                    isPremium:existingUser.isPremium},
                    process.env.TOKEN_SECRET,
                { expiresIn: '1h' }
            );

            res.json({ token });    
        }
    catch(error){
        console.error('Error:', error);
        return res.status(500).json({ error: "Server error" });
      }
};

exports.checkPremiumStatus = async (req, res) => {
    const user =await User.findByPk(req.user.id);
    res.json({ isPremium: user.isPremium });

};

exports.forgetPassword =async (req,res) => {

    const client = Sib.ApiClient.instance;

    const apiKey = client.authentications['api-key'];
    apiKey.apiKey = process.env.MAIL_KEY;

    const tranEmailApi = new Sib.TransactionalEmailsApi()
    const {email} = req.body;
    try{
        const user =await User.findOne({
            where:{email:email}
        })
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // console.log(user)

        // res.json(user);
    
        const sender ={
            email:'rapranjan@gmail.com'
        }
    
        const receivers =[{
            email:email
        }]
    
       await tranEmailApi.sendTransacEmail({
            sender,
            to:receivers,
            subject:"Forgot password! No worries we have you covered",
            htmlContent:`
            <h1>Password Reset</h1>
            <p>You requested a password reset. </p>

            <p>If you didn't request this, please ignore this email.</p>
            `
        })

        res.status(200).json({message: 'Password reset email sent'});

    

    }
    catch(error){
        console.log('Error in forgetPassword:',error);
        res.status(500).json({message:'An error occured',error:error.message})

    }
    
}