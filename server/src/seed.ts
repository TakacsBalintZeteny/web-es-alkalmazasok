
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tables = [
    { name: '1-es asztal', capacity: 2 },
    { name: '2-es asztal', capacity: 4 },
    { name: '3-as asztal', capacity: 4 },
    { name: '4-es asztal', capacity: 6 },
  ]

  for (const table of tables) {
    const existing = await prisma.table.findFirst({
      where: { name: table.name },
    })

    if (!existing) {
      await prisma.table.create({ data: table })
    }
  }

  console.log('A tesztasztalok betöltése sikeres.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
