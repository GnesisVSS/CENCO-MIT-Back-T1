// functions/server.js
const { createServer } = require('http');
const { handler } = require('../dist/main'); // Asegúrate de que esta ruta sea correcta

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }
  
  handler(req, res);
});

module.exports.handler = server;
