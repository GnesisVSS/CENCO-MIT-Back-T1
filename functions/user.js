const serverless = require('serverless-http');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module'); // Asegúrate de la ruta correcta a tu módulo

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
  return app(event, context);
};
