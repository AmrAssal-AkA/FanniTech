import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from '@nestjs/common';

import { AppModule, ObserveInstrument } from './app.module.js';
import { swaggerConfig } from './swagger/swagger.config.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';


const PORT = process.env.PORT ?? 8080;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors();
  app.use(cookieParser());
  app.use(helmet());
  app.useGlobalFilters(new HttpExceptionFilter());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/openapi.json',
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(PORT, () => {
    Logger.log(`Server is running on http://localhost:${PORT}`);
  });
}
await bootstrap();
