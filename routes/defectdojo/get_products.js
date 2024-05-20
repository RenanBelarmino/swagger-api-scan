const express = require('express');
const axios = require('axios');
const router = express.Router();
const version = "v1";
const tool = "defectdojo";

// Rota para obter produtos
/**
 * @swagger
 * /defectdojo/v1/get-products:
 *   get:
 *     summary: Obter lista de produtos
 *     description: Endpoint para obter uma lista de produtos.
 *     tags:
 *       - DefectDojo
 *     responses:
 *       200:
 *         description: Lista de produtos obtida com sucesso
 *       404:
 *         description: Nenhum produto encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get(`/${tool}/${version}/get-products`, async (req, res) => {
    try {
        const response = await axios.get(process.env.DEFECTDOJO_API_URL, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Token ${process.env.DEFECTDOJO_API_TOKEN}`
            }
        });

        // Verifica se a resposta possui a propriedade 'results' e se a matriz 'results' não está vazia
        if (response.data.results && response.data.results.length > 0) {
            // Mapeia a lista de resultados para um objeto contendo nome e descrição de cada produto
            const products = response.data.results.map(result => ({
                name: result.name,
                description: result.description
            }));

            // Retorna a lista de produtos
            return res.json(products);
        } else {
            return res.status(404).json({ error: 'Nenhum resultado encontrado' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;
