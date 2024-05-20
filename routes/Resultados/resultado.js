const express = require('express');
const router = express.Router();
const resultado = require('../../src/data/result.json');

// Rota para obter filmes
/**
 * @swagger
 * /resultado:
 *   get:
 *     summary: Obter resultado
 *     description: Endpoint para obter uma lista de Resultado.
 *     tags:
 *       - Resultados
 *     responses:
 *       200:
 *         description: Lista de Resultado obtida com sucesso
 *       404:
 *         description: Nenhum Resultado encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/resultado', (req, res) => {
    return res.json(resultado);
});

module.exports = router;
