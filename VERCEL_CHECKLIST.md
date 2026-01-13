# Чеклист проверки настроек Vercel

## 1. Проверка настроек проекта в Vercel Dashboard

### Перейдите в настройки проекта:
1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Settings** → **General**

### Проверьте следующие настройки:

#### Framework Preset
- ✅ **Должно быть:** `Next.js`
- ❌ **Не должно быть:** `Other`, `Create React App`, или пустое

#### Root Directory
- ✅ **Должно быть:** `.` (точка, означает корень проекта)
- ❌ **Не должно быть:** `/app`, `/src` или другое значение

#### Build and Output Settings

**Build Command:**
- ✅ **Рекомендуется:** Оставить пустым (Vercel автоматически использует `npm run build`)
- ✅ **Или явно указать:** `npm run build`
- ❌ **Неправильно:** `next build` (без `prisma generate`)

**Output Directory:**
- ✅ **Должно быть:** Пустое поле (Next.js использует `.next`)
- ❌ **Не должно быть:** `/out`, `/build`, `/public`

**Install Command:**
- ✅ **Должно быть:** `npm install` или пустое (по умолчанию)

**Development Command:**
- ✅ **Должно быть:** `npm run dev` или пустое

## 2. Проверка переменных окружения

Перейдите в **Settings** → **Environment Variables**

### Обязательная переменная:
- **Name:** `DATABASE_URL`
- **Value:** Ваша строка подключения к NeonDB
- **Environment:** Должна быть включена для всех сред (Production, Preview, Development)

**Формат строки подключения:**
```
postgresql://user:password@host/database?sslmode=require
```

## 3. Проверка логов сборки

### Где найти логи:
1. В Vercel Dashboard выберите ваш проект
2. Перейдите во вкладку **Deployments**
3. Выберите последний деплой
4. Нажмите на деплой, чтобы открыть детали
5. Вкладка **Build Logs** покажет логи сборки

### Что проверить в логах:

#### ✅ Успешная сборка должна содержать:
```
Running "prisma generate"
...
Running "npm run build"
...
✓ Compiled successfully
```

#### ❌ Типичные ошибки:

1. **Prisma Client не найден:**
```
Error: Cannot find module '@prisma/client'
```
**Решение:** Убедитесь, что `prisma generate` выполняется перед `next build`

2. **Ошибка подключения к БД при сборке:**
```
Error: Can't reach database server
```
**Решение:** Это нормально - Prisma Client генерируется без подключения к БД

3. **Ошибка TypeScript:**
```
Type error: ...
```
**Решение:** Проверьте код на ошибки типов

4. **Ошибка сборки Next.js:**
```
Error occurred while generating the page
```
**Решение:** Проверьте логи для конкретной страницы

## 4. Проверка Runtime Logs

После деплоя проверьте **Runtime Logs** (вкладка в деталях деплоя):

### ✅ Успешный запуск должен показать:
- Запросы к страницам
- Нет ошибок подключения к БД

### ❌ Ошибки могут включать:
- `Error: Can't reach database server` - неправильный DATABASE_URL
- `Error: PrismaClient is not configured` - Prisma Client не сгенерирован
- `404 NOT_FOUND` - проблема с маршрутизацией

## 5. Быстрое исправление настроек

Если настройки неправильные:

1. **Framework Preset не Next.js:**
   - В настройках проекта измените Framework Preset на **Next.js**
   - Пересоберите проект (Redeploy)

2. **Build Command неправильный:**
   - Очистите поле Build Command (оставьте пустым)
   - Или установите: `npm run build`
   - Пересоберите проект

3. **Переменные окружения отсутствуют:**
   - Добавьте `DATABASE_URL` в Environment Variables
   - Убедитесь, что она включена для Production
   - Пересоберите проект

## 6. Рекомендуемые настройки для этого проекта

```
Framework Preset: Next.js
Root Directory: . (корень)
Build Command: (пусто - использовать npm run build из package.json)
Output Directory: (пусто)
Install Command: npm install
Development Command: npm run dev
Node.js Version: 18.x или 20.x (рекомендуется)
```

## Что делать дальше?

После проверки всех настроек:
1. Сохраните изменения в настройках
2. Перейдите в **Deployments**
3. Нажмите **Redeploy** для последнего деплоя (или создайте новый коммит)
4. Проверьте логи новой сборки
