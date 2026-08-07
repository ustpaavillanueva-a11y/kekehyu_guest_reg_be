import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { mkdir } from 'fs/promises';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  getLocalDataRoot,
  getLocalDatabasePath,
  isLocalMode,
} from './common/config/runtime-mode';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GuestsModule } from './modules/guests/guests.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { RoomTypesModule } from './modules/room-types/room-types.module';
import { HotelSettingsModule } from './modules/hotel-settings/hotel-settings.module';
import { TempUploadsModule } from './modules/temp-uploads/temp-uploads.module';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Event Emitter - powers realtime gateway updates
    EventEmitterModule.forRoot(),

    // Database - Supabase PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        if (isLocalMode(configService)) {
          await mkdir(getLocalDataRoot(), { recursive: true });

          return {
            type: 'sqljs' as const,
            location: getLocalDatabasePath(),
            autoSave: true,
            autoLoadEntities: true,
            synchronize: true,
            logging: false,
          };
        }

        return {
          type: 'postgres' as const,
          host: configService.get('DB_HOST'),
          port: configService.get<number>('DB_PORT') || 5432,
          username: configService.get('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: configService.get('NODE_ENV') === 'development',
          migrations: ['dist/migrations/*{.ts,.js}'],
          migrationsRun: true,
          ssl:
            configService.get('DB_SSL') === 'true'
              ? { rejectUnauthorized: false }
              : false,
          logging: configService.get('NODE_ENV') === 'development',
          connectTimeoutMS: 30000,
          extra: {
            connectionTimeoutMillis: 30000,
            idleTimeoutMillis: 30000,
            max: 10,
          },
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    GuestsModule,
    SessionsModule,
    RoomTypesModule,
    HotelSettingsModule,
    TempUploadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Guards - every route requires auth unless marked @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
