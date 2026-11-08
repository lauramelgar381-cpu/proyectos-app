import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { requerirAuth } from '../middleware/auth.js'

const router = Router()

// Los valores se leen al usar la ruta (no al importar), para que dotenv ya los haya cargado
router.post('/login', async (req, res) => {
  const { ADMIN_USER, ADMIN_PASSWORD_HASH, JWT_SECRET } = process.env
  if (!ADMIN_USER || !ADMIN_PASSWORD_HASH || !JWT_SECRET) {
    return res.status(500).json({
      error: 'Falta configurar ADMIN_USER, ADMIN_PASSWORD_HASH o JWT_SECRET en backend/.env',
    })
  }

  const usuario = String(req.body?.usuario ?? '')
  const password = String(req.body?.password ?? '')

  const credencialesValidas =
    usuario === ADMIN_USER && (await bcrypt.compare(password, ADMIN_PASSWORD_HASH))

  if (!credencialesValidas) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
  }

  const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: '8h' })
  res.json({ token, usuario })
})

// Permite al frontend comprobar si el token guardado sigue siendo válido
router.get('/sesion', requerirAuth, (req, res) => {
  res.json({ usuario: req.usuario.usuario })
})

export default router
