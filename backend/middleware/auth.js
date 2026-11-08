import jwt from 'jsonwebtoken'

// Exige un token JWT válido en la cabecera Authorization: Bearer <token>
export function requerirAuth(req, res, next) {
  const cabecera = req.headers.authorization ?? ''
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : ''

  if (!token) {
    return res.status(401).json({ error: 'Necesitas iniciar sesión' })
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'La sesión no es válida o caducó. Vuelve a iniciar sesión.' })
  }
}
