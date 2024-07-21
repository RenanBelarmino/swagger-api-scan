const mongoose = require('mongoose');
const argon2 = require('argon2');

const mongoURI = 'mongodb://root:example@localhost:27017/scanservicesdb?authSource=admin';

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    permissions: {
        sast: {
            scan: { type: Number, required: true },  // 1 = true, 0 = false
            maxConcurrentScans: { type: Number, required: true },
            currentConcurrentScans: { type: Number, default: 0 }
        },
        dast: {
            scan: { type: Number, required: true },  // 1 = true, 0 = false
            maxConcurrentScans: { type: Number, required: true },
            currentConcurrentScans: { type: Number, default: 0 }
        }
    }
});

const User = mongoose.model('User', UserSchema);

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
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
            permissions: {
                sast: {
                    scan: 1,
                    maxConcurrentScans: 2,
                    currentConcurrentScans: 0
                },
                dast: {
                    scan: 0,
                    maxConcurrentScans: 0,
                    currentConcurrentScans: 0
                }
            }
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
        console.log(`${user.password} e ${password}`);

        if (passwordMatch) {
            console.log(`[CONSOLE] - Senha correta para o usuário: ${username}`);
            return {
                username: user.username,
                permissions: user.permissions
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

    const username1 = 'renan2';
    const password = 'renan12';

    // Crie o usuário
    //await createUser(username1, password);

    // Teste a autenticação
    const user = await authenticateUser(username1, password);
    console.log(`[CONSOLE] - Resultado da autenticação: ${JSON.stringify(user)}`);
};

testUserCreationAndAuthentication();
