// functions/server.js
const server = require('../dist/main');  // O la ruta donde se compila tu `main.ts`

module.exports.handler = server.handler;
