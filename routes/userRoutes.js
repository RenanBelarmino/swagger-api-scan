const express = require('express');
const argon2 = require('argon2');
const User = require('../models/User'); // Importar o modelo diretamente
const connectDB = require('../src/config/db');

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
 */
router.post('/users', async (req, res) => {
    const { username, password, permissions } = req.body;
    
    if (!username || !password || !permissions) {
        console.log('Requisição inválida');
        return res.status(400).send('Invalid request');
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Usuário já existe:', username);
            return res.status(400).send('User already exists');
        }

        const hashedPassword = await argon2.hash(password);
        
        const newUser = new User({
            username,
            password: hashedPassword,
            permissions
        });

        await newUser.save();
        console.log('Usuário criado com sucesso:', username);
        res.status(200).send('User created successfully');
    } catch (error) {
        console.error('Erro ao criar usuário:', error.message); // Melhorar a mensagem de erro
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
