const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.TOKEN_SECRET; 

exports.authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try{
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decoded;  // This now includes isPremium
        next();
    }
    catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
      }
};