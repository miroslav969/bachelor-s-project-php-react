import mysql from 'mysql2/promise'

type MysqlPool = mysql.Pool

const globalForMysql = globalThis as unknown as { mysqlPool?: MysqlPool }

const pool =
    globalForMysql.mysqlPool ??
    mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT ?? 3306),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        connectionLimit: Number(process.env.MYSQL_CONN_LIMIT ?? 10),
        decimalNumbers: true
    })

if (process.env.NODE_ENV !== 'production') {
    globalForMysql.mysqlPool = pool
}

export const getPool = () => pool
