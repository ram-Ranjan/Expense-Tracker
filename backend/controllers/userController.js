
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Sequelize  = require('sequelize');
const Expenses = require('../models/expense');


const JWT_SECRET = process.env.TOKEN_SECRET;
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
        if(!existingUser){
            return res.status(400).json({ error: "User Not Found with given email" });
        }
        const isMatch = await bcrypt.compare(password,existingUser.password)
       
        if(isMatch){
            const token = jwt.sign(
                { id: existingUser.id, email: existingUser.email ,isPremium:existingUser.isPremium},
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({ message: "Login successful", token });
        }
        else{
       return res.status(401).json({error:"Incorrect Password"})
        }}
    catch{
        console.error('Error:', error.message);
        return res.status(500).json({ error: "Server error" });
      }
};

exports.checkPremiumStatus = async (req, res) => {
    try {
       // const user = await User.findByPk(req.user.id);
        res.json({ isPremium: req.user.isPremium });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
    
};

exports.getLeaderBoard = async (req,res) => {
    try{
       const leaderboard=await User.findAll({
            attributes:['id',
                'username',
              [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('Expenses.amount')), 0), 'totalExpenses']
            ],           
            include:[{
                model: Expenses,
                attributes:[],
                required: false
            }] ,
            group:['User.id'],
            order: [[Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('Expenses.amount')), 0), 'DESC']],           
            raw:true
        });
        console.log(leaderboard)
        const leaderboardWithHighlight = leaderboard.map(entry => ({
            ...entry,
            isCurrentUser: entry.id === req.user.id
        }));

        res.json(leaderboardWithHighlight);
      
    }
    catch(error){
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
}