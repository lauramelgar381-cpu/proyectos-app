// Genera el hash bcrypt de la contraseña de administrador.
// Uso: npm run crear-hash -- "tu-contraseña"
import bcrypt from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.error('Uso: npm run crear-hash -- "tu-contraseña"')
  process.exit(1)
}

console.log(bcrypt.hashSync(password, 12))
