import mongoose from 'mongoose'

const proyectoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true, maxlength: 120 },
    // Identificador amigable para la URL, p. ej. "security-lab"
    slug: { type: String, unique: true, sparse: true },
    descripcion: { type: String, default: '', trim: true, maxlength: 2000 },
    tecnologias: { type: [String], default: [] },
    githubUrl: { type: String, default: '' },
    demoUrl: { type: String, default: '' },
    imagenPortada: { type: String, default: '' },
    // Portada subida como archivo; select:false evita cargarla en cada consulta
    portadaTipo: { type: String, default: '' },
    portadaDatos: { type: Buffer, select: false },
    // Los proyectos destacados aparecen en la portada
    destacado: { type: Boolean, default: false, index: true },
    estado: { type: String, enum: ['en progreso', 'terminado'], default: 'terminado' },
    // Fecha real del proyecto, usada en la línea de tiempo (si no existe, se usa createdAt)
    fechaProyecto: { type: Date, default: null },
    totalArchivos: { type: Number, default: 0 },
    tamanoTotal: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true } },
)

proyectoSchema.virtual('tienePortada').get(function () {
  return Boolean(this.portadaTipo)
})

export default mongoose.model('Proyecto', proyectoSchema)
