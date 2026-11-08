import { enviarJson, peticion } from './cliente'

export interface RespuestaLogin {
  token: string
  usuario: string
}

export const authApi = {
  login: (usuario: string, password: string) =>
    peticion<RespuestaLogin>('/api/auth/login', enviarJson('POST', { usuario, password })),
}
