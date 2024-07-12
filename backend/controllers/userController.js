const express=require('express');

const User = require('../models/user');

exports.signupUser =async (req,res,next) =>{
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = await User.create({ username, email, password });
        console.log('User Signed Up');
        res.status(201).json({ message: 'User signed up successfully', user: newUser });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
};