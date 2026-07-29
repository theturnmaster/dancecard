import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Test Admin',
      passwordHash,
      role: Role.ADMIN,
    },
  })

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@test.com' },
    update: {},
    create: {
      email: 'teacher@test.com',
      name: 'Test Teacher',
      passwordHash,
      role: Role.TEACHER,
    },
  })

  const parent = await prisma.user.upsert({
    where: { email: 'parent@test.com' },
    update: {},
    create: {
      email: 'parent@test.com',
      name: 'Test Parent',
      passwordHash,
      role: Role.PARENT,
    },
  })

  console.log('Seed completed successfully!')
  console.log('Created accounts:')
  console.log('- Admin:', admin.email)
  console.log('- Teacher:', teacher.email)
  console.log('- Parent:', parent.email)
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
