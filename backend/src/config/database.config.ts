import { DataSource, DataSourceOptions } from 'typeorm';

export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'lensia',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'lensia_db',
  synchronize: true,
  // autoLoadEntities is a NestJS TypeOrmModule option; not available on raw DataSource.
  // For CLI / migrations use explicit entity paths:
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
};

export default new DataSource(databaseConfig);
