const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const connectDB = require('../../src/config/db');

connectDB();


require('dotenv').config();

const secret = process.env.JWT_SECRET;

const generateToken = (username) => {
    console.log(`[CONSOLE] - Gerando token para o usuário: ${username}`);
    return jwt.sign({ username }, secret, { expiresIn: '1h' });
};

const authenticateUser = async (username, password) => {
    console.log(`[CONSOLE] - Autenticando usuário: ${username}`);
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`[CONSOLE] - Usuário não encontrado: ${username}`);
            return null;
        }

        console.log(`[CONSOLE] - Hash armazenado para o usuário ${username}: ${user.password}`);

        const passwordMatch = await argon2.verify(user.password, password);
        console.log(`[passwordMatch] - ${passwordMatch}`);

        if (passwordMatch) {
            console.log(`[CONSOLE] - Senha correta para o usuário: ${username}`);
            return {
                username: user.username,
                permissions: user.permissions,
                // Remover se não estiver usando
                // CONCURRENT_SCANS: user.CONCURRENT_SCANS
            };
        } else {
            console.log(`[CONSOLE] - Senha incorreta para o usuário: ${username}`);
            return null;
        }
    } catch (error) {
        console.error(`[ERROR] - Erro durante a autenticação: ${error.message}`);
        throw error;
    }
};

const verifyToken = async (req, res, next) => {
    console.log(`[CONSOLE] - Verificando token ou credenciais básicas`);
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Basic ')) {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');

        // Autenticar usuário com username e password
        try {
            const user = await authenticateUser(username, password);
            if (user) {
                req.user = user;
                next();
            } else {
                console.log(`[CONSOLE] - Credenciais inválidas`);
                res.status(401).send('Credenciais inválidas');
            }
        } catch (error) {
            console.error(`[ERROR] - Erro ao autenticar com credenciais básicas: ${error.message}`);
            res.status(500).send('Erro interno do servidor');
        }
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, secret, async (err, decoded) => {
            if (err) {
                console.log(`[CONSOLE] - Falha ao autenticar o token: ${err.message}`);
                return res.status(401).send('Falha ao autenticar o token');
            }

            console.log(`[CONSOLE] - Token autenticado com sucesso para o usuário: ${decoded.username}`);
            try {
                const user = await User.findOne({ username: decoded.username });
                if (!user) {
                    console.log(`[CONSOLE] - Usuário não encontrado: ${decoded.username}`);
                    return res.status(404).send('Usuário não encontrado');
                }

                req.user = {
                    username: decoded.username,
                    permissions: user.permissions,
                    // Remover se não estiver usando
                    // CONCURRENT_SCANS: user.CONCURRENT_SCANS
                };
                next();
            } catch (error) {
                console.error(`[ERROR] - Erro ao buscar usuário: ${error.message}`);
                res.status(500).send('Erro interno do servidor');
            }
        });
    } else {
        console.log(`[CONSOLE] - Nenhum token ou credenciais básicas fornecidos`);
        return res.status(403).send('Nenhum token ou credenciais básicas fornecidos');
    }
};

module.exports = { generateToken, authenticateUser, verifyToken };
