# Дипломный проект: Интернет-магазин (Next.js + PHP REST API)

---

## Содержание
- [Возможности](#возможности)
- [Стек технологий](#стек-технологий)
- [Архитектура](#архитектура)
- [Структура репозитория](#структура-репозитория)
- [Требования](#требования)
- [Запуск проекта](#запуск-проекта)
  - [1) База данных (MySQL)](#1-база-данных-mysql)
  - [2) Backend (PHP API)](#2-backend-php-api)
  - [3) Frontend (Nextjs)](#3-frontend-nextjs)
- [Переменные окружения](#переменные-окружения)
- [Роли и доступ](#роли-и-доступ)
- [API (кратко)](#api-кратко)
- [Скрипты и команды](#скрипты-и-команды)
- [Сборка и деплой](#сборка-и-деплой)

---

## Возможности
- Каталог товаров: список, карточка товара, изображения, цена, описание, категория.
- Категории: дерево/список категорий.
- Корзина: добавление/удаление товаров, изменение количества, пересчёт итогов.
- Оформление заказа и сохранение заказов в БД.
- Авторизация/регистрация пользователя.
- Ролевая модель доступа.
- Административные операции: управление товарами/категориями/заказами.
- Документационные артефакты диплома: UML/WADT, таблицы атрибутов сущностей и связи.

---

## Стек технологий
**Frontend**
- Next.js (React, App Router)
- TypeScript
- UI: TailwindCSS

**Backend**
- PHP 7.4+ / 8+
- REST API
- MySQL 5.7+ / 8.0+

---

## Архитектура
- **Next.js** отвечает за пользовательский интерфейс, маршрутизацию страниц и взаимодействие с API.
- **PHP REST API** реализует бизнес-логику и предоставляет эндпоинты для товаров, категорий, корзины, заказов и авторизации.
- **MySQL** хранит бизнес-сущности (пользователи, товары, категории, заказы, позиции заказов и т.п.).

---

## Структура репозитория

```
/
  frontend/              # Next.js приложение
  backend/               # PHP REST API
  database/              # SQL: схема/дампы/миграции/сиды
  README.md
```

---

## Требования
- Node.js 18+ (рекомендуется 20+)
- npm / pnpm / yarn
- PHP 7.4+ (или 8.x)
- MySQL 5.7+ / 8.x
- (Опционально) Composer
- (Для деплоя) Nginx/Apache + PHP-FPM

---

## Запуск проекта

### 1) База данных (MySQL)
1. Создайте базу данных:
   ```sql
   CREATE DATABASE riga_shop
   CHARACTER SET utf8mb4
   COLLATE utf8mb4_unicode_ci;
   ```

2. Импортируйте SQL:
   ```bash
   mysql -u root -p riga_shop < database/schema.sql
   ```

---

### 2) Backend (PHP API)
1. Перейдите в папку backend:
   ```bash
   cd backend
   ```

2. Настройте конфигурацию (вариант A — `.env`, вариант B — `config.php`):
   - создайте `.env` на основе примера ниже **или**
   - заполните значения в конфигурационном файле проекта.

3. Установите зависимости (если используется Composer):
   ```bash
   composer install
   ```

4. Запустите backend:
   - Встроенный сервер PHP (для разработки):
     ```bash
     php -S 127.0.0.1:8000 -t public
     ```
   - Или через Nginx/Apache (рекомендуется для продакшена).

Проверка доступности:
- `http://127.0.0.1:8000/` (или `/api/...` — зависит от маршрутизации)
- если есть health-эндпоинт: `GET /health`

---

### 3) Frontend (Next.js)
1. Перейдите в папку frontend:
   ```bash
   cd frontend
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Создайте файл `.env.local` и укажите URL API (пример ниже).

4. Запустите dev-сервер:
   ```bash
   npm run dev
   ```

Откройте в браузере:
- `http://localhost:3000`

---

## Переменные окружения

### Frontend: `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=****
```

### Backend: `backend/.env` (пример)
```env
APP_ENV=local
APP_URL=http://127.0.0.1:8000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=riga_shop
DB_USER=root
DB_PASS=****

JWT_SECRET=****
UPLOAD_DIR=storage/uploads
```

---

## Роли и доступ
Типовая модель:
- `USER` — работа с каталогом, корзиной, оформление заказа, просмотр истории заказов.
- `ADMIN` — управление товарами/категориями/заказами (если реализовано).

Авторизация зависит от реализации:
- сессии/NextAuth

---

## API
Ниже — ориентировочные группы эндпоинтов:

- **Auth**
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`

- **Products**
  - `GET /products`
  - `GET /products/{id}`
  - `POST /products` (admin)
  - `PUT /products/{id}` (admin)
  - `DELETE /products/{id}` (admin)

- **Categories**
  - `GET /categories`
  - `POST /categories` (admin)
  - `PUT /categories/{id}` (admin)
  - `DELETE /categories/{id}` (admin)

- **Cart**
  - `GET /cart`
  - `POST /cart/items`
  - `PUT /cart/items/{id}`
  - `DELETE /cart/items/{id}`

- **Orders**
  - `POST /orders`
  - `GET /orders`
  - `GET /orders/{id}`

---

## Скрипты и команды

### Frontend
```bash
npm run dev      # запуск в разработке
npm run build    # сборка production
npm run start    # запуск production сборки
```

### Backend (примеры)
```bash
php -S 127.0.0.1:8000 -t public
composer install
composer dump-autoload
```

---

## Сборка и деплой
Рекомендации для продакшена:
- Использовать **Nginx/Apache + PHP-FPM** для backend.
- Собрать Next.js:
  ```bash
  npm run build
  npm run start
  ```
- Настроить права на папку загрузок (`UPLOAD_DIR`) и ограничить доступ к служебным файлам.

---
