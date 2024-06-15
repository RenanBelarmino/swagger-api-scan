const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SCAN SERVICES',
            version: '1.0.0',
            description: 'Documentação da API de Produtos',
        },
        tags: [
            {
                name: 'DAST',
                description: 'APIs relacionadas ao DAST'
            },
            {
                name: 'SAST',
                description: 'APIs relacionadas ao SAST'
            },
            {
                name: 'Authentication',
                description: 'APIs de autenticação'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
                basicAuth: {
                    type: 'http',
                    scheme: 'basic',
                }
            }
        },
        security: [{
            bearerAuth: [], // Esquema de segurança padrão para JWT (Bearer Token)
            basicAuth: []   // Esquema de segurança para Basic Auth (usuário e senha)
        }],
    },
    apis: [
        './routes/sast/*.js', // Rotas do SAST
        './routes/dast/*.js', // Rotas do DAST
        './routes/*.js'
    ],
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};
