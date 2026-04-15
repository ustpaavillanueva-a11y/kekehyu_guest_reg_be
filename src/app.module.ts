import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GuestsModule } from './modules/guests/guests.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { RoomTypesModule } from './modules/room-types/room-types.module';
import { HotelSettingsModule } from './modules/hotel-settings/hotel-settings.module';

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

    // Database - Supabase PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('DB_SSL') === 'true' 
          ? { rejectUnauthorized: false }
          : false,
        logging: configService.get('NODE_ENV') === 'development',
        // Connection pool and timeout settings
        connectTimeoutMS: 30000,
        extra: {
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
          max: 10,
        },
        retryAttempts: 3,
        retryDelay: 3000,
      }),
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    GuestsModule,
    SessionsModule,
    RoomTypesModule,
    HotelSettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Guards (optional - can also be applied per controller)
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule {}
