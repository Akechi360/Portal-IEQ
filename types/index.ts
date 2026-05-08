export type AccessRole = "paciente" | "transito" | "medico" | "gerencia";
export type UserStatus = "Activo" | "Expirado" | "Bloqueado";

export interface UserSessionItem {
  id: string;
  usuario: string;
  nombre: string;
  rol: AccessRole;
  habitacion: string;
  tiempoValidez: string;
  dispositivos: number;
  estado: UserStatus;
}

export interface DeviceItem {
  mac: string;
  etiqueta?: string;
  primerVisto: string;
  ultimoVisto: string;
  estado: "Conectado" | "Desconectado";
}
