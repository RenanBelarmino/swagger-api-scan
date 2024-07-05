const express = require('express');
const router = express.Router();
const { generateToken, authenticateUser } = require('../src/middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Authentication operations
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Authenticate user and generate access token
 *     tags:
 *       - Authentication
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
 *                 example: '******'  # Exemplo de senha para documentação
 *         text/plain:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Insira a senha como texto simples (os caracteres serão visíveis)
 *                 example: '******'  # Exemplo de senha para documentação
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *       401:
 *         description: Invalid credentials
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Invalid credentials
 */
router.post('/', (req, res) => {
    const { username, password } = req.body;
    const user = authenticateUser(username, password);
    if (user) {
        const token = generateToken(user.username);
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

module.exports = router;
