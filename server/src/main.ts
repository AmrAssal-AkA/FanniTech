import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { SwaggerModule } from '@nestjs/swagger';


import { AppModule, ObserveInstrument } from './app.module.js';
import { swaggerConfig } from './swagger/swagger.config.js';

const PORT = process.env.PORT ?? 8080; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
   app.enableCors()
  app.use(cookieParser());
  app.use(helmet());

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: 'docs/openapi.json',
    swaggerOptions: { persistAuthorization: true },
  });
  

  
  await app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
}
await bootstrap();
