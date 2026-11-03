import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from '@nestjs/common';
import {NestExpressApplication} from '@nestjs/platform-express';

import { AppModule, ObserveInstrument } from './app.module.js';
import { swaggerConfig } from './swagger/swagger.config.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';



const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';
const corsOrigin = process.env.WEB_URL && process.env.MOBILE_URL;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors({
    origin:  corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(cookieParser());
  app.use(helmet());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.set('trust proxy', 'loopback');

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/openapi.json',
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(PORT, HOST, () => {
    Logger.log(`Server is running on http://${HOST}:${PORT}`);
  });
}
await bootstrap();
