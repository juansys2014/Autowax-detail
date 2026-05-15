import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'autowax_db',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           'Z',
})

export async function query<T = unknown>(
  sql: string,
  values?: unknown[]
): Promise<T[]> {
  const [rows] = await pool.execute(sql, values)
  return rows as T[]
}

export async function queryOne<T = unknown>(
  sql: string,
  values?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, values)
  return rows[0] ?? null
}

export async function execute(
  sql: string,
  values?: unknown[]
): Promise<{ insertId: number; affectedRows: number }> {
  const [result] = await pool.execute(sql, values) as any
  return { insertId: result.insertId, affectedRows: result.affectedRows }
}

export default pool
