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
                name: 'MOBILE',
                description: 'APIs relacionadas ao Mobile Scan'
            },
            {
                name: 'Horusec',
                description: 'APIs relacionadas ao Horusec' // Adicione a tag Horusec
            }
        ]
    },
    apis: [
        './routes/**/*.js', // Rotas padrão
        './routes/horusec/*.js' // Rotas do Horusec
    ],
};

const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs
};
