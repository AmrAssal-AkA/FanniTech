import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('FanniTech API')
  .setDescription('Authentication and application API documentation')
  .setVersion('1.0')
  .addTag('Authentication')
  .addTag('System')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Mobile access token. Web clients may use the x-access-token cookie.',
    },
    'access-token',
  )
  .addCookieAuth('x-access-token', {
    type: 'apiKey',
    in: 'cookie',
    description: 'Web access token cookie.',
  }, 'web-access-cookie')
  .addCookieAuth('x-refresh-token', {
    type: 'apiKey',
    in: 'cookie',
    description: 'Refresh token cookie.',
  }, 'refresh-cookie')
  .build();
