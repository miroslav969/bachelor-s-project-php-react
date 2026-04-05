/* eslint-disable no-console */
const autocannon = require('autocannon')

const env = process.env

const baseUrl = env.LOAD_TEST_BASE_URL || 'http://127.0.0.1:3000'
const duration = Number(env.LOAD_TEST_DURATION_SEC || 20)
const connections = Number(env.LOAD_TEST_CONNECTIONS || 20)
const pipelining = Number(env.LOAD_TEST_PIPELINING || 1)
const searchQuery = env.LOAD_TEST_QUERY || 'keyboard'
const productsLimit = Number(env.LOAD_TEST_PRODUCTS_LIMIT || 24)
const searchLimit = Number(env.LOAD_TEST_SEARCH_LIMIT || 8)
const maxP95Ms = Number(env.LOAD_TEST_MAX_P95_MS || 800)
const maxErrorRate = Number(env.LOAD_TEST_MAX_ERROR_RATE || 0.02)
const minRequests = Number(env.LOAD_TEST_MIN_REQUESTS || 200)

const toPath = (url) => {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}`
}

async function detectSku() {
    if (env.LOAD_TEST_SKU) return env.LOAD_TEST_SKU

    try {
        const response = await fetch(
            `${baseUrl}/api/products?limit=1`,
            { headers: { accept: 'application/json' } }
        )
        if (!response.ok) return null
        const body = await response.json()
        if (Array.isArray(body) && body[0] && body[0].sku) {
            return String(body[0].sku)
        }
        return null
    } catch {
        return null
    }
}

function runAutocannon(options) {
    return new Promise((resolve, reject) => {
        autocannon(options, (error, result) => {
            if (error) {
                reject(error)
                return
            }
            resolve(result)
        })
    })
}

function summarizeAndCheck(result) {
    const totalRequests = Number(result?.requests?.total || 0)
    const p95 = Number(result?.latency?.p95 || 0)
    const networkErrors = Number(result?.errors || 0) + Number(result?.timeouts || 0)
    const badStatus = Number(result?.non2xx || 0)
    const totalFailures = networkErrors + badStatus
    const errorRate = totalRequests > 0 ? totalFailures / totalRequests : 1

    console.log('')
    console.log('Load test summary:')
    console.log(`- total requests: ${totalRequests}`)
    console.log(`- req/sec avg: ${Number(result?.requests?.average || 0).toFixed(2)}`)
    console.log(`- latency p95: ${p95} ms`)
    console.log(`- failures (errors + non2xx): ${totalFailures}`)
    console.log(`- error rate: ${(errorRate * 100).toFixed(2)}%`)

    const failures = []
    if (totalRequests < minRequests) {
        failures.push(`Requests below threshold: ${totalRequests} < ${minRequests}`)
    }
    if (p95 > maxP95Ms) {
        failures.push(`P95 latency above threshold: ${p95} ms > ${maxP95Ms} ms`)
    }
    if (errorRate > maxErrorRate) {
        failures.push(
            `Error rate above threshold: ${(errorRate * 100).toFixed(2)}% > ${(
                maxErrorRate * 100
            ).toFixed(2)}%`
        )
    }
    return failures
}

async function main() {
    console.log(`Running load test against ${baseUrl}`)
    console.log(
        `Config: duration=${duration}s, connections=${connections}, pipelining=${pipelining}`
    )

    const detectedSku = await detectSku()
    const requests = [
        {
            method: 'GET',
            path: toPath(`${baseUrl}/api/products?limit=${productsLimit}`)
        },
        {
            method: 'GET',
            path: toPath(
                `${baseUrl}/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=${searchLimit}`
            )
        }
    ]

    if (detectedSku) {
        requests.push({
            method: 'GET',
            path: toPath(`${baseUrl}/api/products/${encodeURIComponent(detectedSku)}`)
        })
    } else {
        console.log(
            'SKU route load scenario skipped: no SKU detected. Set LOAD_TEST_SKU to force it.'
        )
    }

    const result = await runAutocannon({
        url: baseUrl,
        duration,
        connections,
        pipelining,
        requests
    })

    const failures = summarizeAndCheck(result)
    if (failures.length > 0) {
        console.error('')
        console.error('Load test failed:')
        for (const failure of failures) {
            console.error(`- ${failure}`)
        }
        process.exitCode = 1
        return
    }

    console.log('')
    console.log('Load test passed thresholds.')
}

main().catch((error) => {
    console.error('Load test failed to run:', error?.message || error)
    process.exitCode = 1
})
