const express = require('express');
const server = express();
const filmes = require('./src/data/filmes.json')
const port = process.env.PORT || 3000

server.get('/filmes', (req, res) =>{
    //return res.json({usuario: 'Nicolle'})
    return res.json(filmes)
});

server.listen(port, () => {
    console.log('Servidor esta funcionando...')
});


