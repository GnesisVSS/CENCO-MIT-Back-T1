// functions/server.js
const { createServer } = require('http');
const { handler } = require('../dist/main'); // Asegúrate de que esta ruta sea correcta

module.exports.handler = handler;
