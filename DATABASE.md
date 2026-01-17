## Что есть в системе (сущности):

Note - заметки
User — владелец котиков, автор, голосующий
Cats — описание котика (может быть приватным или публичным)
Tag — метки (многие-ко-многим с Cats)
Vote — голос пользователя за публичного котика (уникально: один пользователь → один голос на котик)
(опционально) Collection / Folder — папки/коллекции для организации
(опционально) catVersion — версии описания котика (история изменений)

## Ключевые правила:

- Публичность — это свойство Cats (visibility)
- Голосовать можно только по публичным (проверяется на уровне приложения; можно усилить триггером/констрейнтом позже)
- Голос уникален: (userId, catId) — уникальный индекс

## Схема базы данных
- Note: id, ownerId -> User, title, createdAt
- User: id (cuid), email unique, name optional, createdAt
- Cats: id, ownerId -> User, title, content, description optional, categoryId -> Category,
  visibility (PRIVATE|PUBLIC, default PRIVATE), createdAt, updatedAt, publishedAt nullable
- Vote: id, userId -> User, catId -> Cats, value int default 1, createdAt
- Category: id, category
- Ограничение: один пользователь может проголосовать за котика только один раз:
  UNIQUE(userId, catId)
- Индексы:
  Cats(ownerId, updatedAt)
  Cats(visibility, createdAt)
  Vote(catId)
  Vote(userId)
- onDelete: Cascade для связей
