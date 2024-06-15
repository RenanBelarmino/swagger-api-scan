const express = require('express');
const server = express();
const port = process.env.PORT || 3000;
const { swaggerUi, specs } = require('./swagger');
const { verifyToken } = require('./auth'); // Verifique se o caminho está correto

// Middleware para processar JSON no corpo das requisições
server.use(express.json());

server.use((req, res, next) => {
    console.log(`[INFO] - ${new Date().toLocaleString()}: ${req.method} ${req.url}`);
    next();
});

// Middleware de logging para capturar e registrar erros
server.use((err, req, res, next) => {
    console.error(`[ERROR] - ${new Date().toLocaleString()}: ${err.stack}`);
    res.status(500).send('Something broke!');
});

// Middleware de logging para capturar e registrar todas as requisições feitas à Swagger
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// LOGIN
const loginRouter = require('./routes/login');

//SAST
const sast_POST_ScanRouter = require('./routes/sast/s.POST_Scan');
const sast_POST_GIT_ScanRouter = require('./routes/sast/s.POST_Scan_GIT');
const resultSASTRouter = require('./routes/sast/s.GET_SCAN_ID');


//DAST
const dast_POST_ScanRouter = require('./routes/dast/d.POST_Scan');
const dast_GET_ScanRouter = require('./routes/dast/d.GET_SCAN_ID');


// LOGIN
server.use('/api/login', loginRouter);

//SAST
server.use('/api/sast/scan', verifyToken, sast_POST_ScanRouter); 
server.use('/api/sast/scan-git', verifyToken, sast_POST_GIT_ScanRouter);
server.use('/api/resultSAST', verifyToken, resultSASTRouter);


//DAST
server.use('/api/dast/scan', verifyToken, dast_POST_ScanRouter);
server.use('/api/resultDAST', verifyToken, dast_GET_ScanRouter);


server.listen(port, () => {
    console.log(`[INFO] - ${new Date().toLocaleString()}: Servidor está funcionando na porta ${port}`);
});