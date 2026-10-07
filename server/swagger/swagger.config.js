import { DocumentBuilder } from '@nestjs/swagger';
export const swaggerConfig = new DocumentBuilder()
    .setTitle('FanniTech API')
    .setDescription('Authentication and application API documentation')
    .setVersion('1.0')
    .addTag('Authentication')
    .addTag('System')
    .addBearerAuth({
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Mobile access token. Web clients may use the x-access-token cookie.',
}, 'access-token')
    .build();
//# sourceMappingURL=swagger.config.js.map