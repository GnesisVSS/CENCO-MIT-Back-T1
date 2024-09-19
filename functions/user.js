const serverless = require('serverless-http');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module'); // Asegúrate de la ruta correcta

let server;

const createServer = async () => {
  if (!server) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    server = serverless(app.getHttpAdapter().getInstance()); // Para obtener la instancia de Express
  }
  return server;
};

module.exports.handler = async (event, context) => {
  const app = await createServer();
  const result = await app(event, context);

  // Añadir cabeceras CORS
  result.headers['Access-Control-Allow-Origin'] = '*';
  result.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  result.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

  return result;
};
