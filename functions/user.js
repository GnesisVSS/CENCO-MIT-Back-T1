// functions/server.js

const express = require('express');
const serverless = require('serverless-http');
const { handler } = require('../dist/main'); // Asegúrate de que esta ruta sea correcta

const app = express();

// Configura el middleware para manejar todas las rutas
app.use((req, res, next) => {
  handler(req, res, next);
});

// Exporta el handler para Netlify
module.exports.handler = serverless(app);