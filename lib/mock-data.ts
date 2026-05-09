import { DeviceItem, UserSessionItem } from "@/types";

export const USERS_MOCK: UserSessionItem[] = [
  {
    id: "1",
    usuario: "usuario_23910",
    nombre: "Ana Lopez",
    rol: "paciente",
    habitacion: "H-204",
    tiempoValidez: "2 dias + 2 h",
    dispositivos: 4,
    estado: "Activo"
  },
  {
    id: "2",
    usuario: "transito_0044",
    nombre: "Carlos Mena",
    rol: "transito",
    habitacion: "Caja",
    tiempoValidez: "30 minutos",
    dispositivos: 1,
    estado: "Expirado"
  },
  {
    id: "3",
    usuario: "dr.ramirez",
    nombre: "Dr. Jaime Ramirez",
    rol: "medico",
    habitacion: "Urgencias",
    tiempoValidez: "Permanente",
    dispositivos: 3,
    estado: "Activo"
  },
  {
    id: "4",
    usuario: "gerencia_01",
    nombre: "Gerencia General",
    rol: "gerencia",
    habitacion: "Administracion",
    tiempoValidez: "Permanente",
    dispositivos: 5,
    estado: "Bloqueado"
  }
];

export const DEVICES_MOCK: DeviceItem[] = [
  {
    mac: "00:1A:C2:7B:00:47",
    etiqueta: "iPhone",
    primerVisto: "2026-04-23 08:10",
    ultimoVisto: "2026-04-23 11:22",
    estado: "Conectado"
  },
  {
    mac: "9C:3D:CF:2F:BC:11",
    etiqueta: "Laptop",
    primerVisto: "2026-04-22 16:14",
    ultimoVisto: "2026-04-23 09:40",
    estado: "Desconectado"
  }
];
