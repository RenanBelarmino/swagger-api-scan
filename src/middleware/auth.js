const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const connectDB = require('../../src/config/db');

connectDB();

require('dotenv').config();

const secret = process.env.JWT_SECRET;

const generateToken = (login, id) => {
    console.log(`[CONSOLE] - Gerando token para o usuário: ${login}, ID: ${id}`);
    return jwt.sign({ login, id }, secret, { expiresIn: '1h' });
};

const authenticateUser = async (login, password) => {
    console.log(`[CONSOLE] - Autenticando usuário com login: ${login}`);
    try {
        const user = await User.findOne({ login });
        if (!user) {
            console.log(`[CONSOLE] - Usuário não encontrado com login: ${login}`);
            return null;
        }

        console.log(`[CONSOLE] - Hash armazenado para o usuário com login ${login}: ${user.password}`);

        const passwordMatch = await argon2.verify(user.password, password);
        console.log(`[passwordMatch] - ${passwordMatch}`);

        if (passwordMatch) {
            console.log(`[CONSOLE] - Senha correta para o usuário com login: ${login}, ID: ${user.id}`);
            return {
                id: user.id,
                login: user.login,
                permissions: user.permissions,
            };
        } else {
            console.log(`[CONSOLE] - Senha incorreta para o usuário com login: ${login}, ID: ${user.id}`);
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
        const [login, password] = credentials.split(':');

        // Autenticar usuário com login e password
        try {
            const user = await authenticateUser(login, password);
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

            console.log(`[CONSOLE] - Token autenticado com sucesso para o login: ${decoded.login}, ID: ${decoded.id}`);
            try {
                const user = await User.findOne({ login: decoded.login });
                if (!user) {
                    console.log(`[CONSOLE] - Usuário não encontrado com login: ${decoded.login}`);
                    return res.status(404).send('Usuário não encontrado');
                }

                req.user = {
                    id: user.id,
                    login: decoded.login,
                    permissions: user.permissions,
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
