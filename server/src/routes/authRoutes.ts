
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

function createToken(user: { id: number; role: string }) {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('A JWT_SECRET nincs beállítva a .env fájlban.')
  }

  return jwt.sign(
    {
      sub: String(user.id),
      role: user.role,
    },
    secret,
    { expiresIn: '1d' },
  )
}

// Vendég regisztráció
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    password.length < 8
  ) {
    res.status(400).json({
      error: 'Adj meg nevet, érvényes e-mail-címet és legalább 8 karakteres jelszót.',
    })
    return
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      res.status(409).json({
        error: 'Ezzel az e-mail-címmel már létezik fiók.',
      })
      return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        // A szerepkör alapértelmezetten GUEST.
      },
    })

    const token = createToken(user)

    res.status(201).json({
      message: 'Sikeres regisztráció.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Regisztrációs hiba:', error)

    res.status(500).json({
      error: 'Nem sikerült a regisztráció.',
    })
  }
})

// Bejelentkezés
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    res.status(400).json({
      error: 'Az e-mail-cím és a jelszó megadása kötelező.',
    })
    return
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    })

    if (!user) {
      res.status(401).json({
        error: 'Hibás e-mail-cím vagy jelszó.',
      })
      return
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash,
    )

    if (!passwordMatches) {
      res.status(401).json({
        error: 'Hibás e-mail-cím vagy jelszó.',
      })
      return
    }

    const token = createToken(user)

    res.json({
      message: 'Sikeres bejelentkezés.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Bejelentkezési hiba:', error)

    res.status(500).json({
      error: 'Nem sikerült a bejelentkezés.',
    })
  }
})

export default router
