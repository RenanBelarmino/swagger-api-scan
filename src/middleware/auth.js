const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
require('dotenv').config(); // Carregar variáveis de ambiente do arquivo .env


// Usar uma chave secreta para assinar o JWT; no futuro, pode-se definir no .env
const secret = process.env.JWT_SECRET;


// Função para gerar o token JWT
const generateToken = (username) => {
    console.log(`[CONSOLE] - Gerando token para o usuário: ${username}`);
    return jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Função para autenticar o usuário
const authenticateUser = async (username, password) => {
    console.log(`[CONSOLE] - Autenticando usuário: ${username}`);
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`[CONSOLE] - Usuário não encontrado: ${username}`);
            return null;
        }

        console.log(`[CONSOLE] - Hash armazenado para o usuário ${username}: ${user.password}`);
        console.log(`[CONSOLE] - Comparador de senha teste${user.password}: ${password}`);

        const passwordMatch = await bcrypt.compare(password, user.password);
        
        console.log(`[passwordMatch] - ${passwordMatch}`);

        if (passwordMatch) {
            console.log(`[CONSOLE] - Senha correta para o usuário: ${username}`);
            return {
                username: user.username,
                permissions: user.permissions,
                CONCURRENT_SCANS: user.CONCURRENT_SCANS
            };
        } else {
            console.log(`[CONSOLE] - Senha incorreta para o usuário: ${username}`);
            return null;
        }
    } catch (error) {
        console.error('Erro durante a autenticação:', error.message);
        throw error;
    }
};

// Middleware para verificar o token ou autenticação básica
const verifyToken = async (req, res, next) => {
    console.log(`[CONSOLE] - Verificando token ou credenciais básicas`);
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, secret, async (err, decoded) => {
            if (err) {
                console.log(`[CONSOLE] - Falha ao autenticar o token`);
                console.log(err);
                return res.status(401).send('Falha ao autenticar o token');
            }

            console.log(`[CONSOLE] - Token autenticado com sucesso para o usuário: ${decoded.username}`);
            const user = await User.findOne({ username: decoded.username });
            if (!user) {
                console.log(`[CONSOLE] - Usuário não encontrado: ${decoded.username}`);
                return res.status(404).send('Usuário não encontrado');
            }

            req.user = {
                username: decoded.username,
                permissions: user.permissions,
                CONCURRENT_SCANS: user.CONCURRENT_SCANS
            };
            next();
        });
    } else {
        console.log(`[CONSOLE] - Nenhum token ou credenciais básicas fornecidos`);
        return res.status(403).send('Nenhum token ou credenciais básicas fornecidos');
    }
};


module.exports = { generateToken, authenticateUser, verifyToken };
