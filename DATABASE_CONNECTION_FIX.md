# Исправление ошибки подключения к PostgreSQL

## Проблема

Ошибка: `Error in PostgreSQL connection: Error { kind: Closed, cause: None }`

## Причины

1. **Соединение закрыто** - Prisma пытается использовать закрытое соединение
2. **NeonDB serverless** - соединения автоматически закрываются после периода неактивности
3. **PrismaAdapter** - может пытаться подключиться при инициализации

## Решения

### 1. Убедитесь, что используете Connection Pooling для Neon

В Neon Dashboard:
- Используйте **Connection String** с `-pooler` в hostname
- Или добавьте `?pgbouncer=true` к URL

**Правильный формат для Neon:**
```
postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
```

### 2. Проверьте доступность базы данных

```bash
# Тест подключения через psql (если установлен)
psql "your-database-url"

# Или через Prisma
npx prisma db pull
```

### 3. Перезапустите сервер

После изменения `.env` или проблем с подключением:
1. Остановите сервер (Ctrl+C)
2. Запустите снова: `npm run dev`

### 4. Проверьте health endpoint

Откройте: `http://localhost:3000/api/view-db/health`

Должен показать статус подключения к БД.

## Важно для Neon

Neon - это serverless база данных, соединения могут закрываться. Используйте:
- **Connection Pooler** для production (рекомендуется)
- **Direct connection** только для миграций

В `.env` должна быть строка с `-pooler` в hostname для лучшей стабильности.
