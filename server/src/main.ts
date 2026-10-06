import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import cookieParser from "cookie-parser";
import helmet from "helmet";


import { AppModule, ObserveInstrument } from './app.module.js';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
   
  app.use(cookieParser());
  app.use(helmet());


  
  await app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
await bootstrap();
