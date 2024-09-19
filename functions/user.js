const serverless = require('serverless-http');
const app = require('../dist/main.js'); // O la ruta correcta a tu app

module.exports.handler = serverless(app);
