const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { verifyToken } = require('../../src/middleware/auth');


/**
 * @swagger
 * /api/list-users:
 *   get:
 *     summary: List all users except passwords
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *       - basicAuth: []
 *     responses:
 *       200:
 *         description: A list of users without passwords
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   username:
 *                     type: string
 *                   login:
 *                     type: string
 *                   permissions:
 *                     type: object
 *                     properties:
 *                       sast:
 *                         type: object
 *                         properties:
 *                           scan:
 *                             type: boolean
 *                             example: true
 *                           maxConcurrentScans:
 *                             type: number
 *                           currentConcurrentScans:
 *                             type: number
 *                       dast:
 *                         type: object
 *                         properties:
 *                           scan:
 *                             type: boolean
 *                             example: true
 *                           maxConcurrentScans:
 *                             type: number
 *                           currentConcurrentScans:
 *                             type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Unauthorized
 *       500:
 *         description: Internal server error
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Internal server error
 */
router.get('/', verifyToken, async (req, res) => {
    console.log(`[CONSOLE] - Listando todos os usuários`);

    try {
        const users = await User.find({}, { password: 0 }); // Exclui o campo 'password'
        res.json(users);
    } catch (error) {
        console.error(`[ERROR] - Erro ao listar usuários: ${error.message}`);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
