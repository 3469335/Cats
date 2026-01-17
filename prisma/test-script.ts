import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧪 Запуск тестового скрипта...\n')

  try {
    // 1. Создание тестового пользователя
    console.log('1️⃣ Создание тестового пользователя...')
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Тестовый Пользователь',
      },
    })
    console.log('✅ Пользователь создан:', { id: user.id, email: user.email, name: user.name })

    // 2. Создание категории (если её нет)
    console.log('\n2️⃣ Создание категории...')
    const category = await prisma.category.upsert({
      where: { id: 'test-category-1' },
      update: {},
      create: {
        id: 'test-category-1',
        category: 'Тестовая категория',
      },
    })
    console.log('✅ Категория создана:', { id: category.id, category: category.category })

    // 3. Создание тестового промта (Cat)
    console.log('\n3️⃣ Создание тестового промта (Cat)...')
    const cat = await prisma.cat.create({
      data: {
        title: 'Тестовый котик',
        content: 'Это описание тестового котика для проверки системы.',
        description: 'Короткое описание тестового котика',
        ownerId: user.id,
        categoryId: category.id,
        visibility: 'PUBLIC',
        publishedAt: new Date(),
      },
    })
    console.log('✅ Промт (Cat) создан:', {
      id: cat.id,
      title: cat.title,
      visibility: cat.visibility,
      ownerId: cat.ownerId,
    })

    // 4. Создание голоса (Vote)
    console.log('\n4️⃣ Создание голоса (Vote)...')
    const vote = await prisma.vote.create({
      data: {
        userId: user.id,
        catId: cat.id,
        value: 1,
      },
    })
    console.log('✅ Голос создан:', {
      id: vote.id,
      userId: vote.userId,
      catId: vote.catId,
      value: vote.value,
    })

    // 5. Проверка созданных данных
    console.log('\n5️⃣ Проверка созданных данных...')
    const userWithRelations = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        cats: true,
        votes: true,
        notes: true,
      },
    })

    console.log('✅ Данные пользователя:')
    console.log(`   - Котиков: ${userWithRelations?.cats.length || 0}`)
    console.log(`   - Голосов: ${userWithRelations?.votes.length || 0}`)
    console.log(`   - Заметок: ${userWithRelations?.notes.length || 0}`)

    const catWithVotes = await prisma.cat.findUnique({
      where: { id: cat.id },
      include: {
        votes: true,
        owner: true,
        category: true,
      },
    })

    console.log('\n✅ Данные котика:')
    console.log(`   - Владелец: ${catWithVotes?.owner.email}`)
    console.log(`   - Категория: ${catWithVotes?.category.category}`)
    console.log(`   - Голосов: ${catWithVotes?.votes.length || 0}`)

    console.log('\n🎉 Тестовый скрипт выполнен успешно!')
  } catch (error) {
    console.error('❌ Ошибка при выполнении тестового скрипта:', error)
    throw error
  }
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
