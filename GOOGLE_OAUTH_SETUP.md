# Пошаговая настройка Google OAuth

## 1. Создание OAuth приложения в Google Cloud Console

### Шаг 1: Создание проекта
1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Нажмите на выпадающий список проектов вверху
3. Нажмите **New Project**
4. Введите имя проекта (например: "Cats App")
5. Нажмите **Create**

### Шаг 2: Настройка OAuth consent screen
1. В меню слева выберите **APIs & Services** → **OAuth consent screen**
2. Выберите **External** (для тестирования) или **Internal** (для Google Workspace)
3. Заполните обязательные поля:
   - **App name**: Cats App
   - **User support email**: ваш email
   - **Developer contact information**: ваш email
4. Нажмите **Save and Continue**
5. Пропустите **Scopes** (нажмите **Save and Continue**)
6. Пропустите **Test users** (нажмите **Save and Continue**)
7. Нажмите **Back to Dashboard**

### Шаг 3: Создание OAuth credentials
1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **+ Create Credentials** → **OAuth client ID**
3. Выберите **Application type**: **Web application**
4. Введите **Name**: "Cats App - Local Dev" (или другое имя)
5. В разделе **Authorized redirect URIs** нажмите **+ Add URI**
6. Добавьте URI: `http://localhost:3000/api/auth/callback/google`
   - ⚠️ **ВАЖНО**: Точное совпадение обязательно!
   - Без trailing slash в конце
   - Протокол `http://` для локальной разработки
   - Порт `3000` (или ваш порт)
7. Нажмите **Create**
8. Скопируйте **Client ID** и **Client Secret**

## 2. Настройка переменных окружения

### Добавьте в файл `.env`:

```env
# Auth.js (NextAuth)
AUTH_SECRET="your-generated-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="ваш-client-id-из-google-console.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="ваш-client-secret-из-google-console"
```

### Генерация AUTH_SECRET:

```powershell
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Или используйте онлайн-генератор: https://generate-secret.vercel.app/32

## 3. Проверка конфигурации

### Откройте в браузере:
```
http://localhost:3000/api/auth/check-config
```

Должен вернуться JSON с `status: "ok"` и `allSet: true`

### Если есть ошибки:
- Проверьте, что все переменные добавлены в `.env`
- Убедитесь, что нет лишних пробелов или кавычек
- Перезапустите dev-сервер после изменения `.env`

## 4. Проверка redirect URI в Google Console

⚠️ **КРИТИЧНО**: Redirect URI в Google Console должен точно совпадать!

**Правильно:**
```
http://localhost:3000/api/auth/callback/google
```

**Неправильно:**
```
http://localhost:3000/api/auth/callback/google/  (лишний слэш)
https://localhost:3000/api/auth/callback/google  (https вместо http)
http://127.0.0.1:3000/api/auth/callback/google   (IP вместо localhost)
```

## 5. Типичные ошибки и решения

### Ошибка: "redirect_uri_mismatch"
**Причина**: Redirect URI в Google Console не совпадает с реальным URL

**Решение**: 
1. Проверьте точное совпадение URI
2. Для локальной разработки используйте `http://localhost:3000`
3. Убедитесь, что нет лишних символов или пробелов

### Ошибка: "Configuration"
**Причина**: GOOGLE_CLIENT_ID или GOOGLE_CLIENT_SECRET не установлены или неверные

**Решение**:
1. Проверьте `.env` файл
2. Убедитесь, что значения скопированы правильно (без лишних пробелов)
3. Перезапустите сервер после изменения `.env`

### Ошибка: "AccessDenied"
**Причина**: OAuth consent screen не настроен или приложение не опубликовано

**Решение**:
1. Завершите настройку OAuth consent screen
2. Для тестирования добавьте свой email в "Test users"

## 6. Тестирование

1. Откройте http://localhost:3000/login
2. Нажмите "Войти через Google"
3. Должно открыться окно авторизации Google
4. После авторизации вас перенаправит на `/dashboard`

## 7. Для production (Vercel)

1. Создайте еще один OAuth Client ID в Google Console для production
2. Добавьте redirect URI: `https://your-domain.vercel.app/api/auth/callback/google`
3. Добавьте переменные окружения в Vercel Dashboard:
   - `GOOGLE_CLIENT_ID` (production)
   - `GOOGLE_CLIENT_SECRET` (production)
   - `AUTH_SECRET` (тот же, что и локально)
   - `NEXTAUTH_URL` = `https://your-domain.vercel.app`
