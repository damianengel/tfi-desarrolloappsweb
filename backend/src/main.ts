import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todos los endpoints (ej: http://localhost:3000/api/...)
  app.setGlobalPrefix('api');

  // Validación estricta global con DTOs (Criterio 2 de la rúbrica)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger para documentar la API (Criterio 4 de la rúbrica)
  const config = new DocumentBuilder()
    .setTitle('API Clínica Médica - TFI 2026')
    .setDescription('Endpoints del sistema de gestión de turnos médicos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`\n🚀 Servidor corriendo en: http://localhost:${port}/api`);
  console.log(`📑 Documentación Swagger disponible en: http://localhost:${port}/api/docs\n`);
}
bootstrap().catch((error: unknown) => {
  console.error('No se pudo iniciar la API:', error);
  process.exitCode = 1;
});
