const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'KZ SCAN SERVICES',
            version: '1.0.0',
            description: 'Documentação da API de Produtos',
        },
        tags: [
            {
                name: 'DefectDojo',
                description: 'APIs relacionadas ao DefectDojo'
            },
            {
                name: 'DAST',
                description: 'APIs relacionadas ao DAST'
            },
            {
                name: 'SAST',
                description: 'APIs relacionadas ao SAST'
            },
            {
                name: 'SCA',
                description: 'APIs relacionadas ao SCA'
            },
            {
                name: 'Resultados',
                description: 'APIs relacionadas ao resultado'
            }
        ]
    },
    apis: ['./routes/**/*.js'], // Ajuste o caminho conforme necessário
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};
