const jwt = require('jsonwebtoken');
const users = require('./users'); // Importe os usuários

const secret = process.env.JWT_SECRET || 'your_jwt_secret';

const generateToken = (username) => {
    console.log(`[CONSOLE] - Gerando token para o usuário: ${username}`);
    return jwt.sign({ username }, secret, { expiresIn: '1h' });
};

const authenticateUser = (username, password) => {
    console.log(`[CONSOLE] - Autenticando usuário: ${username}`);
    const userPassword = users[username];
    if (userPassword && userPassword === password) {
        console.log(`[CONSOLE] - Autenticação bem-sucedida para o usuário: ${username}`);
        return { username };
    }
    console.log(`[CONSOLE] - Autenticação falhou para o usuário: ${username}`);
    return null;
};

const verifyToken = (req, res, next) => {
    console.log(`[CONSOLE] - Verificando token`);
    const token = req.headers['authorization'];
    if (!token) {
        console.log(`[CONSOLE] - Nenhum token fornecido`);
        return res.status(403).send('No token provided');
    }

    const tokenPart = token.split(' ')[1]; // Separa o prefixo 'Bearer' do token

    jwt.verify(tokenPart, secret, (err, decoded) => {
        if (err) {
            console.log(`[CONSOLE] - Falha ao autenticar o token`);
            return res.status(500).send('Failed to authenticate token');
        }

        console.log(`[CONSOLE] - Token autenticado com sucesso para o usuário: ${decoded.username}`);
        req.user = decoded.username;
        next();
    });
};

module.exports = { generateToken, authenticateUser, verifyToken };
