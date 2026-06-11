import jwt from 'jsonwebtoken'

export type JwtPayload = {
  id: number
  email: string
}

export const generateToken = (payload: JwtPayload, secret: string) => {
  return jwt.sign(payload, secret, {
    expiresIn: '7d',
  })
}

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload
}
