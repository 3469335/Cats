import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Создание тестового пользователя (или использование существующего)
  const user = await prisma.user.upsert({
    where: { email: 'seed@example.com' },
    update: {},
    create: {
      email: 'seed@example.com',
      name: 'Test User',
    },
  })

  console.log(`User: ${user.email} (${user.id})`)

  // Очистка существующих данных
  await prisma.note.deleteMany({
    where: { ownerId: user.id },
  })

  // Создание тестовых записей с ownerId
  const notes = await prisma.note.createMany({
    data: [
      { title: 'Первая заметка', ownerId: user.id },
      { title: 'Вторая заметка', ownerId: user.id },
      { title: 'Третья заметка', ownerId: user.id },
    ],
  })

  console.log(`Created ${notes.count} notes`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
