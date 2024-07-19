const express = require('express');
const router = express.Router();
const { generateToken, authenticateUser } = require('../src/middleware/auth');
const connectDB = require('../src/config/db'); // Import the MongoDB connection function

// Connect to MongoDB
connectDB();

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
 *                 example: '******'  # Example password for documentation
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
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    console.log(`[CONSOLE] - Tentativa de login para o usuário: ${username}`);

    try {
        const user = await authenticateUser(username, password);
        if (user) {
            const token = generateToken(user.username);
            res.json({ token });
        } else {
            console.log('[CONSOLE] - Credenciais inválidas');
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        console.error(`[CONSOLE] - Erro ao autenticar: ${error.message}`);
        res.status(500).send('Internal server error');
    }
});


module.exports = router;
