
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import {
  CreateBooking,
  BookingUseCaseError,
} from './application/useCases/CreateBooking.js'
import { getAvailableTables } from './application/useCases/getAvailableTables.js'
import authRoutes from './routes/authRoutes.js'
import { authMiddleware } from './middleware/authMiddleware.js'
import { requireRole } from './middleware/requireRole.js'
import { sendBookingConfirmation } from './services/emailService.js'

const app = express()
const prisma = new PrismaClient()
const createBooking = new CreateBooking(prisma)
const PORT = Number(process.env.PORT) || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/auth', authRoutes)

// Egészségügyi ellenőrzés
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'ok',
      database: 'connected',
      message: 'A TableBook backend és az adatbázis működik!',
    })
  } catch {
    res.status(503).json({
      status: 'error',
      message: 'Az adatbázis nem érhető el.',
    })
  }
})

// Szabad asztalok keresése
app.get('/api/tables/available', async (req, res) => {
  const { date, time, guests } = req.query

  if (
    typeof date !== 'string' ||
    typeof time !== 'string' ||
    typeof guests !== 'string'
  ) {
    res.status(400).json({
      error: 'A dátum, az időpont és a vendégek száma kötelező.',
    })
    return
  }

  const guestCount = Number(guests)

  if (!Number.isInteger(guestCount) || guestCount < 1) {
    res.status(400).json({
      error: 'Érvénytelen vendégszám.',
    })
    return
  }

  try {
    const availableTables = await getAvailableTables(prisma, {
      date,
      time,
      guests: guestCount,
    })

    res.json(availableTables)
  } catch (error) {
    console.error('Szabad asztalok keresési hiba:', error)

    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'A szabad asztalok lekérdezése sikertelen.',
    })
  }
})

// Asztalok listázása – nyilvános
app.get('/api/tables', async (_req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { id: 'asc' },
    })

    res.json(tables)
  } catch {
    res.status(500).json({
      error: 'Az asztalok betöltése sikertelen.',
    })
  }
})

// Új asztal felvétele – csak manager
app.post(
  '/api/tables',
  authMiddleware,
  requireRole('MANAGER'),
  async (req, res) => {
    const { name, capacity } = req.body

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      res.status(400).json({
        error: 'Érvénytelen asztaladatok.',
      })
      return
    }

    try {
      const table = await prisma.table.create({
        data: { name: name.trim(), capacity },
      })

      res.status(201).json(table)
    } catch {
      res.status(500).json({
        error: 'Az asztal létrehozása sikertelen.',
      })
    }
  },
)

// Foglalások listázása
// A manager az összeset, a vendég csak a sajátját láthatja.
app.get('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const where =
      req.user!.role === 'MANAGER'
        ? {}
        : { userId: req.user!.id }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        guest: true,
        table: true,
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    })

    res.json(bookings)
  } catch (error) {
    console.error('Foglalások lekérdezési hiba:', error)

    res.status(500).json({
      error: 'A foglalások betöltése sikertelen.',
    })
  }
})

// Új foglalás – bejelentkezett felhasználóknak
app.post('/api/bookings', authMiddleware, async (req, res) => {
  try {
    const booking = await createBooking.execute({
      userId: req.user!.id,
      date: req.body.date,
      time: req.body.time,
      guests: req.body.guests,
      tableId: req.body.tableId,
    })

    if (booking.user) {
  try {
    await sendBookingConfirmation({
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      guestCount: booking.guestCount,
      user: booking.user,
      table: booking.table,
    })

    console.log(
      'Foglalási visszaigazolás elküldve:',
      booking.user.email,
    )
  } catch (emailError) {
    console.error('E-mailküldési hiba:', emailError)
  }
} else {
  console.error(
    'A foglaláshoz nem tartozik felhasználó, ezért nem küldhető e-mail.',
  )
}

    res.status(201).json(booking)
  } catch (error) {
    if (error instanceof BookingUseCaseError) {
      res.status(error.statusCode).json({
        error: error.message,
      })
      return
    }

    console.error('Foglalás létrehozási hiba:', error)

    res.status(500).json({
      error: 'Váratlan hiba történt a foglalás létrehozásakor.',
    })
  }
})

// Foglalás törlése
// A vendég csak a sajátját törölheti, a manager bármelyiket.
app.delete('/api/bookings/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({
      error: 'Érvénytelen foglalásazonosító.',
    })
    return
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      res.status(404).json({
        error: 'A foglalás nem található.',
      })
      return
    }

    if (
      req.user!.role !== 'MANAGER' &&
      booking.userId !== req.user!.id
    ) {
      res.status(403).json({
        error: 'Nincs jogosultságod ennek a foglalásnak a törléséhez.',
      })
      return
    }

    await prisma.booking.delete({
      where: { id },
    })

    res.status(204).end()
  } catch (error) {
    console.error('Foglalás törlési hiba:', error)

    res.status(500).json({
      error: 'A foglalás törlése sikertelen.',
    })
  }
})

app.listen(PORT, () => {
  console.log(`TableBook backend: http://localhost:${PORT}`)
})

async function shutdown() {
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown())
process.on('SIGTERM', () => void shutdown())
