# Тесты проекта

Текущее состояние:
- Unit: 45 тестов (`tests/unit`)
- Route/API: 20 тестов (`tests/routes`)
- Всего: 65 автотестов
- Отдельно: нагрузочный сценарий (`tests/load/products-routes.load.cjs`)

## Как запускать

```bash
npm test
```

```bash
npm run test:unit
```

```bash
npm run test:routes
```

```bash
npm run test:load
```

Для `test:load` приложение должно быть запущено (например, `npm run dev`).

## Что покрывается в коде

- API-роуты: `src/app/api/products/**`
- Маппинг и утилиты: `src/lib/products.ts`, `src/lib/db.ts`, `src/lib/i18n.ts`
- Контексты: `src/lib/context/**`
- Основные UI-компоненты: `src/components/**`
- Страницы и клиентские контейнеры: `src/app/**`
- Layout/Home: `src/app/layout.jsx`, `src/app/page.jsx`

## Детализация по каждому тесту

## `tests/routes/products.route.test.ts` (8 тестов)
1. `returns products for base query`  
Проверяет базовый GET `/api/products` без фильтров: SQL без `WHERE`/`LIMIT`, статус `200`, корректный маппинг ответа.
2. `filters by sku list and clamps limit to 200`  
Проверяет `skus` + слишком большой `limit`: формируется `WHERE sku IN (?, ?)` и лимит режется до `200`.
3. `trims and keeps only non-empty sku values`  
Проверяет очистку `skus` от пробелов и пустых значений.
4. `returns empty list when skus parameter has no values`  
Проверяет, что при полностью пустом `skus` роут возвращает `[]` и не ходит в БД.
5. `ignores invalid limit value`  
Проверяет, что нечисловой `limit` игнорируется и `LIMIT` в SQL не добавляется.
6. `ignores non-positive limits`  
Проверяет, что `limit=0` и отрицательный `limit` не попадают в SQL.
7. `uses limit when positive and below cap`  
Проверяет корректное использование валидного лимита (`limit=25`).
8. `returns 500 when query fails`  
Проверяет обработку ошибки БД: `500` и `{ error: 'Failed to load products.' }`.

## `tests/routes/products.search.route.test.ts` (8 тестов)
1. `returns empty list for blank query`  
Проверяет, что пустой/пробельный `q` возвращает `[]` без запроса в БД.
2. `returns empty list for too short query`  
Проверяет отсечение короткого запроса (`q` длиной < 2).
3. `searches by one term with default limit 8`  
Проверяет SQL для одного терма и дефолтный лимит `8`.
4. `trims query and still searches`  
Проверяет trim строки поиска и корректную подстановку `%term%`.
5. `supports multi-term query and clamps limit to 50`  
Проверяет multi-term (`AND` между термами) и ограничение лимита до `50`.
6. `falls back to limit 8 when limit is invalid`  
Проверяет fallback лимита при невалидном значении.
7. `falls back to default limit when limit is zero or negative`  
Проверяет fallback лимита при `0` и отрицательных значениях.
8. `returns 500 when search query fails`  
Проверяет обработку ошибки БД: `500` и `{ error: 'Failed to search products.' }`.

## `tests/routes/products.sku.route.test.ts` (4 теста)
1. `returns product by sku`  
Проверяет успешный поиск по SKU, SQL с `WHERE sku = ? LIMIT 1`, статус `200`.
2. `returns first row when db responds with multiple rows`  
Проверяет, что при нескольких строках используется первая.
3. `returns 404 when product is missing`  
Проверяет отсутствие товара: `404` и `{ error: 'Product not found.' }`.
4. `returns 500 when lookup fails`  
Проверяет ошибку БД: `500` и `{ error: 'Failed to load product.' }`.

## `tests/unit/i18n.test.ts` (2 теста)
1. `contains expected locales`  
Проверяет наличие локалей `ru`, `en`, `lv`.
2. `contains required keys for each locale`  
Проверяет обязательные ключи переводов (`catalog`, `search`, `cart`, `wishlist`, `profile`) для каждой локали.

## `tests/unit/db.test.ts` (3 теста)
1. `creates mysql pool from environment variables`  
Проверяет, что пул создаётся из env-переменных и кешируется глобально в non-production.
2. `reuses existing global pool in non-production mode`  
Проверяет повторное использование `globalThis.mysqlPool`.
3. `does not cache pool globally in production`  
Проверяет, что в production пул не пишется в глобальный кеш.

## `tests/unit/products.mapper.test.ts` (5 тестов)
1. `maps json and csv fields into api shape`  
Проверяет полный маппинг `ProductRow -> Product`, включая JSON и CSV поля.
2. `supports already parsed arrays/objects`  
Проверяет работу с уже распарсенными массивами/объектами.
3. `returns undefined for invalid json blocks`  
Проверяет fallback в `undefined` при битом JSON.
4. `parses keyword json array string`  
Проверяет парсинг `keywords` из JSON-массива в строке.
5. `drops invalid old_price value`  
Проверяет, что некорректный `old_price` отбрасывается.

## `tests/unit/contexts.test.tsx` (5 тестов)
1. `throws when useCart is used outside provider`  
Проверяет защиту хука `useCart` вне провайдера.
2. `supports cart actions and totals`  
Проверяет загрузку корзины из `localStorage`, действия (`add/increase/decrease/remove/clear`) и пересчёт totals.
3. `loads and changes language`  
Проверяет чтение языка из `localStorage`, переключение и сохранение.
4. `loads products successfully and handles refresh failure`  
Проверяет успешный `fetch` товаров, затем сценарий ошибки `refresh`.
5. `toggles wishlist and checks inclusion`  
Проверяет toggle wishlist и проверку `isInWishlist`.

## `tests/unit/components.simple.test.tsx` (6 тестов)
1. `renders blog section`  
Проверяет рендер `BlogSection`.
2. `renders footer with navigation links`  
Проверяет рендер `Footer` и количество ссылок.
3. `renders product section and applies limit`  
Проверяет `ProductSection` и ограничение `limit`.
4. `shows and closes filter modal`  
Проверяет открытый `FilterModal` и закрытие по оверлею.
5. `shows and closes category filter modal`  
Проверяет открытый `CategoryFilterModal` и закрытие по кнопке.
6. `renders catalog modal and switches category links`  
Проверяет рендер `CatalogModal` и переключение активной категории.

## `tests/unit/components.contextual.test.tsx` (3 теста)
1. `changes language from switcher dropdown`  
Проверяет `LanguageSwitcher`: открытие выпадающего меню и вызов `setLang`.
2. `handles add-to-cart and wishlist toggle in product card`  
Проверяет `ProductCard`: toggle избранного, add в корзину, вызов toast.
3. `renders recently viewed section based on localStorage`  
Проверяет `LastViewed`: чтение `viewed` из `localStorage` и передачу данных в секцию.

## `tests/unit/components.searchbar.test.tsx` (2 теста)
1. `does not request api for query shorter than 2 chars`  
Проверяет, что при коротком вводе запросы в API не отправляются.
2. `shows search results and closes on outside click`  
Проверяет запрос поиска, отображение результатов и закрытие дропдауна по клику вне компонента.

## `tests/unit/components.header-slider.test.tsx` (2 теста)
1. `loads catalog data and opens catalog from header`  
Проверяет загрузку категорий в `Header` и открытие каталога.
2. `opens catalog modal from slider and keeps fetched categories`  
Проверяет загрузку категорий в `PromoSlider` и открытие `CatalogModal` по клику на слайд.

## `tests/unit/pages.wrapper.test.tsx` (4 теста)
1. `passes slug to category client`  
Проверяет, что обёртка category page пробрасывает `params.slug`.
2. `passes sku to product client`  
Проверяет, что обёртка product page пробрасывает `params.sku`.
3. `renders profile page client`  
Проверяет рендер `ProfileClient` через page-обёртку.
4. `renders confirm client inside suspense boundary`  
Проверяет рендер `ConfirmClient` через `Suspense` в confirm page.

## `tests/unit/pages.layout-home.test.tsx` (3 теста)
1. `creates root layout tree with metadata and children`  
Проверяет структуру `RootLayout` (`html`/`body`) и вложение children.
2. `shows loading state on home page`  
Проверяет загрузочное состояние `HomePage`.
3. `shows products section when loading is finished`  
Проверяет рабочее состояние `HomePage` при загруженных товарах.

## `tests/unit/pages.cart-checkout-wishlist.test.tsx` (3 теста)
1. `renders cart items and handles cart actions`  
Проверяет рендер корзины, действия increase/decrease/remove и переход к checkout.
2. `submits checkout and navigates to confirm page`  
Проверяет валидацию согласия, генерацию `orderId` и редирект на confirm.
3. `renders wishlist states based on loading and items`  
Проверяет состояния wishlist: loading, empty, список товаров.

## `tests/unit/pages.user-flow.test.tsx` (7 тестов)
1. `renders filtered category products and opens filter modal`  
Проверяет фильтрацию `CategoryClient` по slug/query и открытие фильтра.
2. `handles product page loading, missing and found states`  
Проверяет три состояния `ProductClient`: loading, not found, found + запись `viewed`.
3. `saves confirm order from query string and avoids duplicates`  
Проверяет запись заказа в `localStorage` и защиту от дублей в `ConfirmClient`.
4. `renders and filters order history with expandable rows`  
Проверяет фильтрацию и раскрытие заказа в `OrderHistoryPage`.
5. `redirects to register when profile user is missing`  
Проверяет редирект на `/register`, если пользователя нет.
6. `loads profile data and deletes account`  
Проверяет загрузку профиля из `localStorage` и удаление аккаунта.
7. `validates register form and saves user on success`  
Проверяет валидацию регистрации и успешное сохранение пользователя с переходом в профиль.

## Нагрузочный сценарий

Файл: `tests/load/products-routes.load.cjs`

Что проверяет:
- Нагрузку на `GET /api/products`
- Нагрузку на `GET /api/products/search`
- Нагрузку на `GET /api/products/:sku` (если SKU найден/передан)
- Пороговые метрики:
  - `p95` latency
  - error rate
  - минимальное число запросов

Параметры порогов и нагрузки управляются через env (`LOAD_TEST_*`).

## Вспомогательные файлы тестовой инфраструктуры

- `tests/setup/vitest.setup.ts`  
Глобальные моки (`next/*`, `framer-motion`, `swiper/*`) и тестовые shims browser API.
- `tests/routes/fixtures.ts`  
Фикстуры строк БД/моделей для route-тестов.
- `tests/unit/fixtures/products.ts`  
Фикстуры продуктов для unit-тестов компонентов/страниц.
