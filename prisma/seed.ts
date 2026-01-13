import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Очистка существующих данных
  await prisma.note.deleteMany()

  // Создание тестовых записей
  const notes = await prisma.note.createMany({
    data: [
      { title: 'Первая заметка' },
      { title: 'Вторая заметка' },
      { title: 'Третья заметка' },
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
