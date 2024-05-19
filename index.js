const express = require('express');
const axios = require('axios');
const server = express();
const filmes = require('./src/data/filmes.json');
const port = process.env.PORT || 3000;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const version = "v1"
const tool = "defectdojo"

require('dotenv').config();

// Middleware para processar JSON no corpo das requisições
server.use(express.json());

server.get('/filmes', (req, res) => {
    return res.json(filmes);
});



// Defina as opções de configuração para o Swagger
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'KZ SCAN SERVICES',
            version: '1.0.0',
            description: 'Documentação da API de Produtos',
        },
    },
    // Lista de arquivos contendo comentários Swagger
    apis: ['./index.js'], // Substitua './index.js' pelo caminho do seu arquivo principal
};

// Gere a especificação Swagger
const specs = swaggerJsdoc(options);

// Use a interface do Swagger no seu servidor Express
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rota para obter produtos
/**
 * @swagger
 * /defectdojo/v1/get-products:
 *   get:
 *     summary: Obter lista de produtos
 *     description: Endpoint para obter uma lista de produtos.
 *     responses:
 *       200:
 *         description: Lista de produtos obtida com sucesso
 *       404:
 *         description: Nenhum produto encontrado
 *       500:
 *         description: Erro interno do servidor
 * 
 * 
 * 
 */

// Rota para obter filmes
/**
 * @swagger
 * /filmes:
 *   get:
 *     summary: Obter lista de filmes
 *     description: Endpoint para obter uma lista de filmes.
 *     responses:
 *       200:
 *         description: Lista de filmes obtida com sucesso
 *       404:
 *         description: Nenhum filme encontrado
 *       500:
 *         description: Erro interno do servidor
 */

server.get(`/${tool}/${version}/get-products`, async (req, res) => {
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


server.listen(port, () => {
    console.log('Servidor está funcionando...');
});
