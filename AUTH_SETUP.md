# Настройка аутентификации через Google OAuth

## Шаги для настройки

### 1. Создание Google OAuth приложения

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Перейдите в **APIs & Services** → **Credentials**
4. Нажмите **Create Credentials** → **OAuth client ID**
5. Выберите тип приложения: **Web application**
6. Добавьте **Authorized redirect URIs**:
   - Для локальной разработки: `http://localhost:3000/api/auth/callback/google`
   - Для production: `https://your-domain.com/api/auth/callback/google`
7. Скопируйте **Client ID** и **Client Secret**

### 2. Генерация AUTH_SECRET

Выполните в терминале:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Или используйте онлайн-генератор: https://generate-secret.vercel.app/32

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта (или обновите существующий):

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Auth.js (NextAuth)
AUTH_SECRET="your-generated-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Применение изменений к базе данных

```bash
npm run db:push
```

Это добавит поле `image` в таблицу `users`.

### 5. Запуск приложения

```bash
npm run dev
```

Откройте http://localhost:3000/login и проверьте вход через Google.

## Защищенные маршруты

Следующие маршруты защищены middleware и требуют авторизации:
- `/dashboard` - панель управления
- `/my-prompts` - мои промты (котики)

Неавторизованные пользователи автоматически перенаправляются на `/login`.

## API endpoints

- `GET /api/auth/signin` - страница входа
- `POST /api/auth/callback/google` - callback от Google OAuth
- `GET/POST /api/auth/signout` - выход из системы
- `GET /api/auth/session` - получение текущей сессии

## Server-side функции

В файле `lib/auth.ts` доступны следующие функции:

- `getCurrentUser()` - получить текущего пользователя
- `getCurrentUserId()` - получить ID текущего пользователя
- `isAuthenticated()` - проверить, авторизован ли пользователь
- `requireAuth()` - требовать авторизации (бросает ошибку если не авторизован)

## Client-side функции

Для использования в client components:

```tsx
import { signIn, signOut, useSession } from 'next-auth/react'

// Вход
await signIn('google')

// Выход
await signOut()

// Получение сессии
const { data: session } = useSession()
```

## Troubleshooting

### Ошибка "Configuration"
- Проверьте, что `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` правильно установлены
- Убедитесь, что redirect URI в Google Console совпадает с вашим доменом

### Ошибка подключения к БД
- Проверьте `DATABASE_URL` в `.env`
- Убедитесь, что база данных доступна

### Пользователь не создается
- Проверьте, что `PrismaAdapter` правильно настроен в `auth.ts`
- Убедитесь, что поле `image` добавлено в таблицу `users` (выполните `npm run db:push`)
