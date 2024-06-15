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

const mobile_start_Router = require('./routes/mobile/m_start');

const dast_POST_ScanRouter = require('./routes/dast/d.POST_Scan');
const dast_GET_ScanRouter = require('./routes/dast/d.GET_SCAN_ID');

const sast_POST_ScanRouter = require('./routes/sast/s.POST_Scan'); 
const sast_POST_GIT_ScanRouter = require('./routes/sast/s.POST_Scan_GIT.js');
const sast_GET_ScanRouter = require('./routes/sast/s.GET_SCAN_ID');



// Usar as rotas
server.use(resultadosRouter);
server.use(productsRouter);
server.use(mobile_start_Router);
server.use(dast_GET_ScanRouter);
server.use(dast_POST_ScanRouter);

server.use(sast_GET_ScanRouter); 
server.use(sast_POST_ScanRouter); 
server.use(sast_POST_GIT_ScanRouter); 


server.listen(port, () => {
    console.log('Servidor está funcionando...');
});
