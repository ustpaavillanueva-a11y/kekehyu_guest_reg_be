import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { mkdir } from 'fs/promises';
import { getLocalUploadsRoot, isLocalMode } from './common/config/runtime-mode';
import { isOriginAllowed } from './common/config/cors-origins';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Root endpoint handler (before global prefix)
  app.use('/', (req, res, next) => {
    if (req.path === '/' && req.method === 'GET') {
      return res.json({
        status: 'ok',
        message: 'Guest Registration API is running',
        timestamp: new Date().toISOString(),
      });
    }
    next();
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  if (isLocalMode(configService)) {
    const uploadsRoot = getLocalUploadsRoot();
    await mkdir(uploadsRoot, { recursive: true });
    app.use('/uploads', express.static(uploadsRoot));
  }

  // CORS - Allow frontend origins (override/extend via ALLOWED_ORIGINS, comma-separated)
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || isOriginAllowed(origin, configService)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Kekehyu Hotel - Guest Registration API')
    .setDescription(
      `
      ## Hotel Guest Registration System API
      
      ### Roles:
      - **Front Desk**: Can register guests and view own registrations
      - **Admin**: Can view dashboard, guests, and front desk activity
      - **Super Admin**: Full access including user management and CRUD operations
      
      ### Authentication:
      Use the /auth/login endpoint to get JWT token, then authorize using the lock icon.
      `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management (Super Admin only)')
    .addTag('Guests', 'Guest registration and management')
    .addTag('Sessions', 'User session tracking')
    .addTag('Room Types', 'Room type management')
    .addTag('Hotel Settings', 'Hotel settings and policies')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Kekehyu Hotel API Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
