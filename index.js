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

// Middleware de logging para capturar e registrar todas as requisições feitas à Swagger
server.use('/api-docs', (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
}, auth, swaggerUi.serve, swaggerUi.setup(specs));

// Importar as rotas
const resultadosRouter = require('./routes/Resultados/resultado');
const productsRouter = require('./routes/defectdojo/get_products');
const dast_start_Router = require('./routes/dast/d_start');
const mobile_start_Router = require('./routes/mobile/m_start');
const dast_report_Router = require('./routes/dast/report');

const horusecPOSTScanRouter = require('./routes/horusec/horusec_scan'); 
const horusecGET_ScanRouter = require('./routes/horusec/result_id');


// Usar as rotas
server.use(resultadosRouter);
server.use(productsRouter);
server.use(mobile_start_Router);
server.use(dast_start_Router);
server.use(dast_report_Router);
server.use(horusecPOSTScanRouter); 
server.use(horusecGET_ScanRouter); 


server.listen(port, () => {
    console.log('Servidor está funcionando...');
});
