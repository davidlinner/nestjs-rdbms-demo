import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pg from 'pg';

@Controller('health')
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  // #region health-raw-pg
  @Get()
  async check() {
    // The "before" picture: a new connection for every request,
    // SQL as a string, and the row mapped by hand.
    const client = new pg.Client({
      connectionString: this.config.get<string>('DATABASE_URL'),
    });
    try {
      await client.connect();
      const result = await client.query<{ version: string }>('SELECT version()');
      return { status: 'ok', postgres: result.rows[0].version };
    } catch (error) {
      throw new ServiceUnavailableException(
        `Database connection failed: ${(error as Error).message}`,
      );
    } finally {
      await client.end().catch(() => undefined);
    }
  }
  // #endregion health-raw-pg
}
