This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database

Products are now stored in MySQL and fetched via Next.js API routes.

1. Create the table:

```bash
mysql -u root -p your_db < db/schema.sql
```

2. Seed products:

```bash
mysql -u root -p your_db < db/seed.sql
```

3. Configure environment variables (e.g., in `.env.local`):

```
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=app
MYSQL_PASSWORD=secret
MYSQL_DATABASE=shop
```

## Tests

Route tests are located in `tests/routes`.

```bash
npm run test:routes
```

Unit tests:

```bash
npm run test:unit
```

Run all tests:

```bash
npm test
```

Load test for API product routes (requires a running app, e.g. `npm run dev`):

```bash
npm run test:load
```

Optional load-test env vars:

```bash
LOAD_TEST_BASE_URL=http://127.0.0.1:3000
LOAD_TEST_DURATION_SEC=20
LOAD_TEST_CONNECTIONS=20
LOAD_TEST_PIPELINING=1
LOAD_TEST_QUERY=keyboard
LOAD_TEST_SKU=SKU-1
LOAD_TEST_MAX_P95_MS=800
LOAD_TEST_MAX_ERROR_RATE=0.02
LOAD_TEST_MIN_REQUESTS=200
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
