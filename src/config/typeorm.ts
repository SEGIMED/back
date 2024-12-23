import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { registerAs } from '@nestjs/config';

config({ path: '.env' });

const db_config = {
  type: 'postgres',
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT as unknown as number,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  autoLoadEntities: true,
  synchronize: true,
  //dropSchema: true,
  logging: true,
  entities: ['dist/**/entities/*.entity.{ts,js}'],
  migrations: ['dist/migrations/*.{js,ts}'],
};

export default registerAs('typeorm', () => db_config);

export const connectionSource = new DataSource(db_config as DataSourceOptions);
