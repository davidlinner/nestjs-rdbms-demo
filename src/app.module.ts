import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller.js';
import { HomeworkModule } from './homework/homework.module.js';
import { UniversityModule } from './university/university.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // #region datasource-config
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, // the schema is changed by migrations only
        migrations: [`${import.meta.dirname}/migrations/*.js`],
        migrationsRun: false, // run them explicitly: npm run migration:run
        logging: ['query', 'error'],
        // #region pool-options
        extra: {
          max: 10, // at most 10 open connections
          idleTimeoutMillis: 30_000, // close connections idle for 30 s
        },
        // #endregion pool-options
      }),
    }),
    // #endregion datasource-config
    UniversityModule,
    HomeworkModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
