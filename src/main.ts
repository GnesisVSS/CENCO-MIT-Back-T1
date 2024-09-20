import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exceptionFilter/http-exception.filter';
import { UserService } from './user/user.service';
import { CreateUserDto } from './user/dto/create-user.dto';
import { Role } from './user/entities/role.enum';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Acceder a la instancia de Express
  const expressApp = app.getHttpAdapter().getInstance() as express.Express;
  expressApp.enable('trust proxy');
  expressApp.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.sendStatus(200); // Respondemos 200 OK para OPTIONS
    }
    next();
  });
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        return new BadRequestException(
          errors.map((error) => ({
            field: error.property,
            errors: Object.values(error.constraints),
          })),
        );
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const userService = app.get(UserService);
  const userEmail = configService.get<string>('defaultAdmin.email');
  const existingUser = await userService.findByEmail(userEmail);

  if (!existingUser) {
    const userDTO: CreateUserDto = {
      name: configService.get<string>('defaultAdmin.name'),
      rut: configService.get<string>('defaultAdmin.rut'),
      email: userEmail,
      password: configService.get<string>('defaultAdmin.password'),
      role: Role.ADMIN,
    };

    const admin = await userService.create(userDTO);
    console.log('Inserted admin:', admin);
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
