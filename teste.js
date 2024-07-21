const mongoose = require('mongoose');
const argon2 = require('argon2');

const mongoURI = 'mongodb://root:example@localhost:27017/scanservicesdb?authSource=admin';

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    permissions: [String],
    CONCURRENT_SCANS: Number
});

const User = mongoose.model('User', UserSchema);

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000
        });
        console.log('[CONSOLE] - Conectado ao MongoDB com sucesso.');
    } catch (error) {
        console.error('[CONSOLE] - Erro ao conectar ao MongoDB:', error.message);
        process.exit(1);
    }
};

const createUser = async (username, password) => {
    try {
        const hashedPassword = await argon2.hash(password);

        const user = new User({
            username,
            password: hashedPassword,
            permissions: ['sast'],
            CONCURRENT_SCANS: 1
        });

        await user.save();
        console.log(`[CONSOLE] - Novo usuário criado: ${username}`);
    } catch (error) {
        console.error('Erro ao criar usuário:', error.message);
    }
};

const authenticateUser = async (username, password) => {
    console.log(`[CONSOLE] - Autenticando usuário: ${username}`);
    try {
        const user = await User.findOne({ username });
        if (!user) {
            console.log(`[CONSOLE] - Usuário não encontrado: ${username}`);
            return null;
        }

        const passwordMatch = await argon2.verify(user.password, password);

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

const testUserCreationAndAuthentication = async () => {
    await connectDB();

    const username1 = 'renan1';
    const password = 'renan123';
    const username2 = 'renan2';

    // Crie os usuários
    await createUser(username1, password);
    await createUser(username2, password);

    // Teste a autenticação
    await authenticateUser(username1, password);
    await authenticateUser(username2, password);
};

testUserCreationAndAuthentication();
