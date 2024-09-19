// functions/server.js

import { ExpressAdapter } from "@nestjs/platform-express";

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module'); // Ajusta la ruta según sea necesario
const express = require('express');

let app;

async function bootstrap() {
  if (!app) {
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(express()));
    nestApp.enableCors({
      origin: '*', // Ajusta esta URL según tus necesidades
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
    await nestApp.init();
    app = nestApp.getHttpAdapter().getInstance(); // Obtener la instancia de Express
  }
  return app;
}

exports.handler = async (event, context) => {
  const server = await bootstrap();

  return new Promise((resolve, reject) => {
    server.handle({
      method: event.httpMethod,
      url: event.path,
      headers: event.headers,
      body: event.body,
      query: event.queryStringParameters,
    }, {
      end: (body) => resolve({
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*', // Ajusta según tu necesidad
          'Content-Type': 'application/json',
        },
        body,
      }),
      statusCode: (code) => {
        return {
          end: (body) => resolve({
            statusCode: code,
            headers: {
              'Access-Control-Allow-Origin': '*', // Ajusta según tu necesidad
              'Content-Type': 'application/json',
            },
            body,
          })
        };
      },
    });
  });
};
