
import type { Request, Response, NextFunction } from 'express'
import type { AuthUser } from './authMiddleware.js'

type UserRole = AuthUser['role']

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({
        error: 'Bejelentkezés szükséges.',
      })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Nincs jogosultságod ehhez a művelethez.',
      })
      return
    }

    next()
  }
}
