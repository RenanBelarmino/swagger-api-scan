const express = require('express');
const argon2 = require('argon2');
const User = require('../../models/User');
const Sequence = require('../../models/Sequence'); // Importar o modelo de sequência
const connectDB = require('../../src/config/db');

const router = express.Router();

// Conectar ao MongoDB
connectDB();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               login:
 *                 type: string
 *               password:
 *                 type: string
 *               permissions:
 *                 type: object
 *                 properties:
 *                   sast:
 *                     type: object
 *                     properties:
 *                       scan:
 *                         type: boolean
 *                       maxConcurrentScans:
 *                         type: number
 *                   dast:
 *                     type: object
 *                     properties:
 *                       scan:
 *                         type: boolean
 *                       maxConcurrentScans:
 *                         type: number
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Requisição inválida
 *       409:
 *         description: Login já existe
 */
router.post('/users', async (req, res) => {
    const { username, login, password, permissions, admin } = req.body;

    // Verifica se os campos obrigatórios estão presentes
    if (!username || !login || !password || !permissions) {
        console.log('Requisição inválida');
        return res.status(400).send('Invalid request');
    }

    try {
        // Verifica se o login já existe
        const existingUserByLogin = await User.findOne({ login });
        if (existingUserByLogin) {
            console.log('Login já existe:', login);
            return res.status(409).send('Login already exists');
        }

        // Gera o próximo ID sequencial
        const sequence = await Sequence.findByIdAndUpdate(
            { _id: 'user_id' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        const newId = sequence.sequence_value;

        // Hash da senha
        const hashedPassword = await argon2.hash(password);

        // Cria um novo usuário com o valor de admin fornecido ou padrão
        const newUser = new User({
            id: newId,
            username,
            login,
            password: hashedPassword,
            admin: admin !== undefined ? admin : false, // Usa o valor fornecido ou o padrão
            permissions
        });

        // Salva o usuário no banco de dados
        await newUser.save();
        console.log(`Usuário criado com sucesso: ${username} (ID: ${newId})`);
        res.status(200).json({ id: newId, login });
    } catch (error) {
        console.error('Erro ao criar usuário:', error.message);
        res.status(500).send('Internal server error');
    }
});


module.exports = router;
