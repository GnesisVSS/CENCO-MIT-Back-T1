// functions/user.js

const express = require('express');
const cors = require('cors');
const { handler } = require('../dist/main'); // Asegúrate de que esta ruta sea correcta

const app = express();

// Configura CORS
app.use(cors());

// Configura el middleware para manejar todas las rutas
app.use('/', (req, res, next) => {
  // Redirige todas las solicitudes a la aplicación NestJS
  handler(req, res, next);
});

// Exporta el handler para Netlify
module.exports.handler = require('serverless-http')(app);
