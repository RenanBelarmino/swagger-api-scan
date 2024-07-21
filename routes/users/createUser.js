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
 *     tags: [Authentication]
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
 *                         type: number
 *                       maxConcurrentScans:
 *                         type: number
 *                   dast:
 *                     type: object
 *                     properties:
 *                       scan:
 *                         type: number
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
    const { username, login, password, permissions } = req.body;

    if (!username || !login || !password || !permissions) {
        console.log('Requisição inválida');
        return res.status(400).send('Invalid request');
    }

    try {
        // Verificar se o login já existe
        const existingUser = await User.findOne({ login });
        if (existingUser) {
            console.log('Login já existe:', login);
            return res.status(409).send('Login already exists');
        }

        // Gerar o próximo ID sequencial
        const sequence = await Sequence.findByIdAndUpdate(
            { _id: 'user_id' },
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );

        const newId = sequence.sequence_value;

        const hashedPassword = await argon2.hash(password);
        
        const newUser = new User({
            id: newId,
            username,
            login,
            password: hashedPassword,
            permissions
        });

        await newUser.save();
        console.log('Usuário criado com sucesso:', username);
        res.status(200).send('User created successfully');
    } catch (error) {
        console.error('Erro ao criar usuário:', error.message);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
