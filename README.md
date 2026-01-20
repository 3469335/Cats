# Cats - сервис обмена информацией о котиках

# Минимальный рабочий проект на Next.js (App Router) + Prisma + NeonDB (PostgreSQL), готовый к деплою на Vercel.

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
├── public/             # Статические файлы (требуется для Vercel)
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
3. Убедитесь, что база данных NeonDB создана и доступна

### 2. Деплой

1. Перейдите на [Vercel](https://vercel.com)
2. Импортируйте ваш репозиторий
3. **ВАЖНО**: Добавьте переменную окружения перед деплоем:
   - **Name**: `DATABASE_URL`
   - **Value**: ваша строка подключения к NeonDB (получите из Neon Dashboard)
   - Формат: `postgresql://user:password@host/database?sslmode=require`
4. Нажмите "Deploy"

### 3. Настройка базы данных после деплоя

После успешного деплоя необходимо применить схему к базе данных:

**Вариант 1: Через Vercel CLI (рекомендуется)**

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в аккаунт
vercel login

# Подключите проект
vercel link

# Примените схему к production БД
vercel env pull .env.production
npx prisma db push --schema=./prisma/schema.prisma
```

**Вариант 2: Локально с production DATABASE_URL**

```bash
# Временно установите production DATABASE_URL
export DATABASE_URL="your-production-neon-url"
# или в Windows PowerShell:
# $env:DATABASE_URL="your-production-neon-url"

# Примените схему
npx prisma db push

# Заполните базу данных
npm run db:seed
```

### 4. Проверка деплоя

После применения схемы откройте ваш сайт на Vercel. Если всё настроено правильно:
- Страница загрузится без ошибок
- Вы увидите либо список заметок, либо сообщение о том, что заметок нет
- Если видите ошибку подключения к БД - проверьте `DATABASE_URL` в настройках Vercel

### 5. Автоматизация (опционально)

Для автоматического применения миграций можно использовать Vercel Post-Deploy Hook или GitHub Actions.

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
