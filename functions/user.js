const serverless = require('serverless-http');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module'); // Asegúrate de la ruta correcta

let server;

const createServer = async () => {
  if (!server) {
    const app = await NestFactory.create(AppModule);

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);


    await app.init();
    server = serverless(app.getHttpAdapter().getInstance()); // Para obtener la instancia de Express
  }
  return server;
};

module.exports.handler = async (event, context) => {
  const app = await createServer();

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    };
  }

  const result = await app(event, context);

  // Añadir cabeceras CORS
  result.headers['Access-Control-Allow-Origin'] = '*';
  result.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
  result.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';

  return result;
};
