
const User = require('../models/user');
const bcrypt = require('bcrypt');

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
            res.status(200).json({ message: "Login successful", userId: existingUser.id });
        }
        else{
       return res.status(401).json({error:"Incorrect Password"})
        }}
    catch{
        console.error('Error:', error.message);
        return res.status(500).json({ error: "Server error" });
      }
};