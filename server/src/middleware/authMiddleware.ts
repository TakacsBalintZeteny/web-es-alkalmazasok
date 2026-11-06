
import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export type AuthUser = {
  id: number
  role: 'GUEST' | 'MANAGER'
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'A hozzáféréshez bejelentkezés szükséges.',
    })
    return
  }

  const token = authorization.substring(7)
  const secret = process.env.JWT_SECRET

  if (!secret) {
    res.status(500).json({
      error: 'A szerver hitelesítési beállítása hiányzik.',
    })
    return
  }

  try {
    const decoded = jwt.verify(token, secret)

    if (
      typeof decoded === 'string' ||
      typeof decoded.sub !== 'string' ||
      !/^[1-9]\d*$/.test(decoded.sub) ||
      (decoded.role !== 'GUEST' && decoded.role !== 'MANAGER')
    ) {
      res.status(401).json({
        error: 'Érvénytelen hitelesítési token.',
      })
      return
    }

    req.user = {
      id: Number(decoded.sub),
      role: decoded.role,
    }

    next()
  } catch {
    res.status(401).json({
      error: 'A token érvénytelen vagy lejárt.',
    })
  }
}
