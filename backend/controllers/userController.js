
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Sequelize  = require('sequelize');
const Expenses = require('../models/expense');


exports.signupUser =async (req,res,next) =>{
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword =await bcrypt.hash(password, 10); 

        const newUser = await User.create({ username, email, password: hashedPassword});
        console.log('User Signed Up');
        res.status(201).json({ message: 'User created successfully', userId: newUser.id });
          }
    catch{
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
    res.json({ isPremium: req.user.isPremium });

};

