import { createRouter, createWebHistory } from 'vue-router'
import { leerToken } from '@/api/cliente'
import PublicLayout from '@/layouts/PublicLayout.vue'
import LayoutView from '@/LayoutView.vue'
import TableProyecto from '@/components/TableProyecto.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // Bienvenida: primera pantalla antes del login, sin navegación del sitio
      path: '/bienvenida',
      name: 'bienvenida',
      component: () => import('@/views/BienvenidaView.vue'),
    },
    {
      // Login: vista independiente, sin navegación del sitio
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      // Sitio público: perfil, galería y detalle de proyecto
      path: '/',
      component: PublicLayout,
      children: [
        {
          path: '',
          name: 'inicio',
          component: () => import('@/views/InicioView.vue'),
        },
        {
          path: 'galeria',
          name: 'galeria',
          component: () => import('@/views/GaleriaView.vue'),
        },
        {
          path: 'proyectos/:id',
          name: 'proyecto',
          component: () => import('@/views/ProyectoDetalleView.vue'),
        },
      ],
    },
    {
      // Panel de administración: requiere sesión
      path: '/admin',
      component: LayoutView,
      meta: { requiereAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'admin-proyectos' },
        },
        {
          path: 'proyectos',
          name: 'admin-proyectos',
          component: TableProyecto,
        },
        {
          path: 'subir',
          name: 'subir',
          component: () => import('@/components/FormProyecto.vue'),
        },
        {
          path: 'proyectos/:id/editar',
          name: 'editar',
          component: () => import('@/views/EditarProyectoView.vue'),
        },
        {
          path: 'proyectos/:id/tareas',
          name: 'admin-tareas',
          component: () => import('@/views/TareasView.vue'),
        },
        {
          path: 'perfil',
          name: 'admin-perfil',
          component: () => import('@/views/EditarPerfilView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'inicio' },
    },
  ],
})

router.beforeEach((to) => {
  const haySesion = leerToken() !== null

  if (to.matched.some((registro) => registro.meta.requiereAuth) && !haySesion) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && haySesion) {
    return { name: 'admin-proyectos' }
  }
  return true
})

export default router
