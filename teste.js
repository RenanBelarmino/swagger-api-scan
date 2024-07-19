const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Definir a URI de conexão do MongoDB diretamente no código
const mongoURI = 'mongodb://root:example@localhost:27017/scanservicesdb?authSource=admin';

// Definir o modelo User (ajuste conforme o caminho correto para seu modelo)
const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    permissions: [String],
    CONCURRENT_SCANS: Number
});

const User = mongoose.model('User', UserSchema);

// Função para conectar ao MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000 // Aumenta o timeout para 30 segundos
        });
        console.log('[CONSOLE] - Conectado ao MongoDB com sucesso.');
    } catch (error) {
        console.error('[CONSOLE] - Erro ao conectar ao MongoDB:', error.message);
        process.exit(1); // Encerrar o processo com erro
    }
};

// Função para criar um novo usuário
const createUser = async (username, password) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({
            username,
            password: hashedPassword,
            permissions: ['sast'], // Exemplo de permissões
            CONCURRENT_SCANS: 1
        });

        await user.save();
        console.log(`[CONSOLE] - Novo usuário criado: ${username}`);
    } catch (error) {
        console.error('Erro ao criar usuário:', error.message);
    }
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
        console.log(`[CONSOLE] - Comparador de senha teste ${user.password}: ${password}`);

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

// Testar a conexão, criar um usuário e autenticar
const testUserCreationAndAuthentication = async () => {
    await connectDB(); // Conectar ao MongoDB

    const username = 'renan'; // Nome de usuário de teste
    const password = 'renan123'; // Senha de teste

    // Crie o usuário
    await createUser(username, password);

    // Teste a autenticação
    await authenticateUser(username, password);
};

// Executar o teste
testUserCreationAndAuthentication();
