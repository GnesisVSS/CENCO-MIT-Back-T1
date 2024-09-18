// Este código es solo un ejemplo. Asegúrate de que tu main.js exporte la función handler correctamente.
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./app.module');

let cachedServer;

async function bootstrap() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
      origin: '*', 
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    await app.listen(3000);
    cachedServer = app.getHttpServer();
  }
  return cachedServer;
}

module.exports.handler = async (event, context) => {
  const server = await bootstrap();
  // Aquí puedes añadir el código para manejar las solicitudes y respuestas
  // Esto puede variar dependiendo de cómo quieras manejar las solicitudes
  return new Promise((resolve, reject) => {
    server.emit('request', event, {
      end: (body) => resolve({
        statusCode: 200,
        body,
      }),
      // Aquí puedes añadir más lógica para manejar las respuestas
    });
  });
};
