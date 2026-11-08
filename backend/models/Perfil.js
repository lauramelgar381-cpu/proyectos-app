import mongoose from 'mongoose'

// Un único documento con los datos de la página de perfil (se identifica con `clave`)
const perfilSchema = new mongoose.Schema(
  {
    clave: { type: String, default: 'principal', unique: true },
    nombre: { type: String, default: '', trim: true, maxlength: 120 },
    titulo: { type: String, default: '', trim: true, maxlength: 120 },
    bio: { type: String, default: '', trim: true, maxlength: 2000 },
    habilidades: { type: [String], default: [] },
    enlaces: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    // Foto y CV se guardan dentro del documento; select:false evita cargarlos en cada consulta
    fotoTipo: { type: String, default: '' },
    fotoDatos: { type: Buffer, select: false },
    cvNombre: { type: String, default: '' },
    cvDatos: { type: Buffer, select: false },
  },
  { timestamps: true },
)

export default mongoose.model('Perfil', perfilSchema)
