const jwt = require('jsonwebtoken');
const users = require('../config/users'); // Importe os usuários

const secret = process.env.JWT_SECRET || 'your_jwt_secret';

const generateToken = (username) => {
    console.log(`[CONSOLE] - Gerando token para o usuário: ${username}`);
    return jwt.sign({ username }, secret, { expiresIn: '1h' });
};

const authenticateUser = (username, password) => {
    console.log(`[CONSOLE] - Autenticando usuário: ${username}`);
    const user = users[username];
    if (user && user.password === password) {
        console.log(`[CONSOLE] - Autenticação bem-sucedida para o usuário: ${username}`);
        return {
            username,
            permissions: user.permissions,
            CONCURRENT_SCANS: parseInt(user.CONCURRENT_SCANS)  // Retorna o limite de scans concorrentes como um número inteiro
        };
    }
    console.log(`[CONSOLE] - Autenticação falhou para o usuário: ${username}`);
    return null;
};

const verifyToken = (req, res, next) => {
    console.log(`[CONSOLE] - Verificando token ou credenciais básicas`);

    const token = req.headers['authorization'];
    if (token && token.startsWith('Bearer ')) {
        const tokenPart = token.split(' ')[1]; // Separa o prefixo 'Bearer' do token

        jwt.verify(tokenPart, secret, (err, decoded) => {
            if (err) {
                console.log(`[CONSOLE] - Falha ao autenticar o token`);
                return res.status(500).send('Failed to authenticate token');
            }

            console.log(`[CONSOLE] - Token autenticado com sucesso para o usuário: ${decoded.username}`);
            const user = users[decoded.username];
            if (!user) {
                console.log(`[CONSOLE] - Usuário não encontrado: ${decoded.username}`);
                return res.status(404).send('User not found');
            }

            req.user = {
                username: decoded.username,
                permissions: user.permissions,
                CONCURRENT_SCANS: parseInt(user.CONCURRENT_SCANS)
            };
            next();
        });
    } else if (req.headers.authorization) {
        const authHeader = req.headers.authorization.split(' ');
        const basicAuth = Buffer.from(authHeader[1], 'base64').toString().split(':');
        const username = basicAuth[0];
        const password = basicAuth[1];

        const user = authenticateUser(username, password);
        if (user) {
            console.log(`[CONSOLE] - Autenticação básica bem-sucedida para o usuário: ${username}`);
            req.user = user; // Define o usuário autenticado e suas permissões
            next();
        } else {
            console.log(`[CONSOLE] - Autenticação básica falhou para o usuário: ${username}`);
            return res.status(401).send('Failed to authenticate basic credentials');
        }
    } else {
        console.log(`[CONSOLE] - Nenhum token ou credenciais básicas fornecidos`);
        return res.status(403).send('No token or basic credentials provided');
    }
};

module.exports = { generateToken, authenticateUser, verifyToken };
