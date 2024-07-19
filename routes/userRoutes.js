const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
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
 *                 type: array
 *                 items:
 *                   type: string
 *               CONCURRENT_SCANS:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Requisição inválida
 */
router.post('/users', async (req, res) => {
    const { username, password, permissions, CONCURRENT_SCANS } = req.body;
    
    if (!username || !password || !permissions || !Number.isInteger(CONCURRENT_SCANS)) {
        console.log('Requisição inválida');
        return res.status(400).send('Invalid request');
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Usuário já existe:', username);
            return res.status(400).send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            permissions,
            CONCURRENT_SCANS
        });

        await newUser.save();
        console.log('Usuário criado com sucesso:', username);
        res.status(200).send('User created successfully');
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
