export type ApiRole = "Paciente" | "Transito" | "Medico" | "Gerencia";
export type ApiStatus = "Active" | "Expired" | "Blocked";

export interface LoginRequestDto {
  username: string;
  passwordOrToken?: string;
  role?: ApiRole;
  clientMac: string;
  apMac: string;
  ssid: string;
  redirect: string;
}

export interface LoginResponseDto {
  ok: boolean;
  nextUrl?: string;
  sessionId?: string;
  message?: string;
}

export interface IssueRequestDto {
  type: ApiRole;
  personName: string;
  room?: string;
  operator: string;
  maxDevices: number;
  doctorInDatabase?: boolean;
  doctorData?: {
    email: string;
    specialty: string;
    phone: string;
  };
}

export interface ListQueryDto {
  role?: "Paciente" | "Transito" | "Medico" | "Gerencia" | "Todos";
  status?: "Active" | "Expired" | "Blocked" | "All";
  search?: string;
  page?: number;
  limit?: number;
}
