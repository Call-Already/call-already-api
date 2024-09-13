const jwt = require('jsonwebtoken');
const jwtSecretAccessToken = process.env.jwtSecretAccessToken;

const generateToken = (UserID) => {
    return jwt.sign({ UserID }, jwtSecretAccessToken, {
        expiresIn: '1h'
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, jwtSecretAccessToken);
};

module.exports = { generateToken, verifyToken };
