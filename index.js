const express = require('express');
const server = express();
const port = process.env.PORT || 3000;
const { swaggerUi, specs } = require('./swagger'); // Importar a configuração do Swagger
require('dotenv').config();
const basicAuth = require('express-basic-auth');

// Importar os usuários
const users = require('./users');

// Configuração básica de autenticação
const auth = basicAuth({
    users, // Usando os usuários importados
    challenge: true, // Exibe a caixa de diálogo de autenticação quando o acesso não é autorizado
});

// Middleware para processar JSON no corpo das requisições
server.use(express.json());

// Use a interface do Swagger no seu servidor Express
server.use('/api-docs', auth, swaggerUi.serve, swaggerUi.setup(specs));

// Importar as rotas
const resultadosRouter = require('./routes/Resultados/resultado');
const productsRouter = require('./routes/defectdojo/get_products');
const dastRouter = require('./routes/dast/start');
const dast_report_Router = require('./routes/dast/report');

// Usar as rotas
server.use(resultadosRouter);
server.use(productsRouter);
server.use(dastRouter);
server.use(dast_report_Router);

server.listen(port, () => {
    console.log('Servidor está funcionando...');
});
