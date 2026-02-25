import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  });
  app.enableShutdownHooks();
  // app.use(helmet());
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Gestao API')
    .setDescription('User management API for Gestao app')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
