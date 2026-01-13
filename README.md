# Cats - сервис обмена информацией о котиках

Минимальный рабочий проект на Next.js (App Router) + Prisma + NeonDB (PostgreSQL), готовый к деплою на Vercel.

## Технологии

- **Next.js 14** (TypeScript, App Router)
- **Prisma** (ORM)
- **NeonDB** (PostgreSQL)
- **Vercel** (деплой)

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

1. Создайте базу данных в [Neon Dashboard](https://console.neon.tech)
2. Скопируйте строку подключения (Connection String)
3. Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
```

4. Вставьте строку подключения в `.env`:

```
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### 3. Настройка Prisma

Сгенерируйте Prisma Client:

```bash
npx prisma generate
```

### 4. Применение миграций

```bash
npx prisma db push
```

Или создайте миграцию:

```bash
npx prisma migrate dev --name init
```

### 5. Заполнение базы данных (seed)

```bash
npm run db:seed
```

### 6. Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

```
.
├── app/
│   ├── layout.tsx      # Корневой layout
│   ├── page.tsx        # Главная страница (читает данные из БД)
│   └── globals.css     # Глобальные стили
├── lib/
│   └── prisma.ts       # Prisma Client (singleton)
├── prisma/
│   ├── schema.prisma   # Схема базы данных
│   └── seed.ts         # Скрипт для заполнения БД
├── .env.example        # Пример переменных окружения
└── package.json        # Зависимости и скрипты
```

## Модель данных

### Note

- `id` (uuid) - уникальный идентификатор
- `title` (string) - заголовок заметки
- `createdAt` (DateTime) - дата создания

## Команды

```bash
# Разработка
npm run dev              # Запуск dev-сервера

# База данных
npm run db:push          # Применить изменения схемы к БД
npm run db:migrate       # Создать миграцию
npm run db:seed          # Заполнить БД тестовыми данными

# Сборка
npm run build            # Сборка для production
npm run start            # Запуск production-сервера
```

## Деплой на Vercel

### 1. Подготовка

1. Убедитесь, что все изменения закоммичены в Git
2. Создайте репозиторий на GitHub/GitLab/Bitbucket

### 2. Деплой

1. Перейдите на [Vercel](https://vercel.com)
2. Импортируйте ваш репозиторий
3. Добавьте переменную окружения:
   - **Name**: `DATABASE_URL`
   - **Value**: ваша строка подключения к NeonDB
4. Нажмите "Deploy"

### 3. Настройка Prisma на Vercel

Vercel автоматически выполнит `postinstall` скрипт, который сгенерирует Prisma Client.

После первого деплоя выполните миграцию:

```bash
npx prisma migrate deploy
```

Или используйте `db:push` для применения схемы:

```bash
npx prisma db push
```

### 4. Заполнение базы данных

После деплоя выполните seed (локально с указанием production DATABASE_URL):

```bash
DATABASE_URL="your-production-url" npm run db:seed
```

Или через Vercel CLI:

```bash
vercel env pull
npm run db:seed
```

## Проверка работы

После деплоя откройте главную страницу вашего приложения. Если всё настроено правильно, вы увидите список заметок из базы данных PostgreSQL (Neon).

## Troubleshooting

### Ошибка подключения к БД

- Проверьте, что `DATABASE_URL` правильно настроен в `.env` (локально) и в настройках Vercel (production)
- Убедитесь, что строка подключения содержит `?sslmode=require`

### Prisma Client не найден

```bash
npx prisma generate
```

### Миграции не применяются

```bash
npx prisma db push
```

## Лицензия

См. файл LICENSE
