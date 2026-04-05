import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('db pool', () => {
    const originalEnv = process.env

    beforeEach(() => {
        vi.resetModules()
        process.env = { ...originalEnv }
        delete (globalThis as { mysqlPool?: unknown }).mysqlPool
    })

    afterEach(() => {
        process.env = originalEnv
        delete (globalThis as { mysqlPool?: unknown }).mysqlPool
    })

    it('creates mysql pool from environment variables', async () => {
        const createPool = vi.fn(() => ({ id: 'pool' }))
        vi.doMock('mysql2/promise', () => ({
            default: { createPool },
            createPool
        }))

        process.env.MYSQL_HOST = '127.0.0.1'
        process.env.MYSQL_PORT = '3307'
        process.env.MYSQL_USER = 'app'
        process.env.MYSQL_PASSWORD = 'secret'
        process.env.MYSQL_DATABASE = 'shop'
        process.env.MYSQL_CONN_LIMIT = '12'
        process.env.NODE_ENV = 'development'

        const { getPool } = await import('@/lib/db')
        const pool = getPool()

        expect(pool).toEqual({ id: 'pool' })
        expect(createPool).toHaveBeenCalledWith({
            host: '127.0.0.1',
            port: 3307,
            user: 'app',
            password: 'secret',
            database: 'shop',
            connectionLimit: 12,
            decimalNumbers: true
        })
        expect((globalThis as { mysqlPool?: unknown }).mysqlPool).toEqual({ id: 'pool' })
    })

    it('reuses existing global pool in non-production mode', async () => {
        const existingPool = { id: 'existing' }
        ;(globalThis as { mysqlPool?: unknown }).mysqlPool = existingPool

        const createPool = vi.fn(() => ({ id: 'new' }))
        vi.doMock('mysql2/promise', () => ({
            default: { createPool },
            createPool
        }))
        process.env.NODE_ENV = 'development'

        const { getPool } = await import('@/lib/db')

        expect(getPool()).toBe(existingPool)
        expect(createPool).not.toHaveBeenCalled()
    })

    it('does not cache pool globally in production', async () => {
        const createPool = vi.fn(() => ({ id: 'pool' }))
        vi.doMock('mysql2/promise', () => ({
            default: { createPool },
            createPool
        }))
        process.env.NODE_ENV = 'production'

        const { getPool } = await import('@/lib/db')

        expect(getPool()).toEqual({ id: 'pool' })
        expect((globalThis as { mysqlPool?: unknown }).mysqlPool).toBeUndefined()
    })
})
