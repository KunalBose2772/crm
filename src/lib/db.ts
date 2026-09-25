import mysql from 'mysql2/promise';

// Create a singleton connection pool for Next.js API routes
declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

const pool =
  global._mysqlPool ||
  mysql.createPool({
    host: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

if (process.env.NODE_ENV !== 'production') {
  global._mysqlPool = pool;
}

export default pool;

/**
 * Helper to run queries with error safety
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}
