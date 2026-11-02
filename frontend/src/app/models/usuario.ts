export enum RolesUsuarios {
  ADMINISTRADOR = 'ADMINISTRADOR',
  MEDICO = 'MEDICO',
  PACIENTE = 'PACIENTE'
}

export interface Usuario {
  id: number;
  documento?: string;
  apellidos: string;
  nombres: string;
  email: string;
  rol: RolesUsuarios;
  id_medico?: number | null;
}

export interface Paciente {
  id: number;
  nombres: string;
  apellidos: string;
}

export interface LoginResponse {
  access_token: string;
  usuario: Usuario;
}
