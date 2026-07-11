// app/login/LoginClient.tsx
// Componente client-side del portal cautivo único
// Maneja el selector entre "Acceso con código", "Soy médico" y "Personal"

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Mail, AlertCircle, Wifi, ArrowRight, CheckCircle2, ShieldCheck, ShieldPlus, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/styles";
import styles from "./login.module.css";

interface LoginClientProps {
  mac: string;
  ip: string;
  redirect: string;
  ssid: string;
  loginUrl?: string;
  logoutUrl?: string;
}

type TabType = "code" | "doctor" | "staff";
type StatusType = "idle" | "loading" | "success" | "error";

export function LoginClient({ mac, ip, redirect, ssid, loginUrl = "", logoutUrl = "" }: LoginClientProps) {
  const router = useRouter();
  // El gateway manda el nombre de la VLAN (p.ej. "VLAN233"), no el SSID real
  const displaySsid =
    ssid && !/^vlan/i.test(ssid) ? ssid : "WiFi Clinica IEQ Los Mangos";

  // WISPr: si el gateway mandó login_url, tras validar el voucher redirigimos
  // al gateway con las credenciales para que él conceda el acceso a internet.
  // El voucher se usa como username y password (Cuenta local / RADIUS PAP).
  function redirectToWisprLogin(credential: string, successUrl: string) {
    const url = new URL(loginUrl);
    url.searchParams.set("username", credential);
    url.searchParams.set("password", credential);
    url.searchParams.set("next_url", successUrl);
    window.location.href = url.toString();
  }
  const [activeTab, setActiveTab] = useState<TabType>("code");

  // Formulario de código (PACIENTE / TRANSITO)
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<StatusType>("idle");
  const [codeError, setCodeError] = useState("");

  // Formulario de médico
  const [email, setEmail] = useState("");
  const [doctorStatus, setDoctorStatus] = useState<StatusType>("idle");
  const [doctorError, setDoctorError] = useState("");

  // Formulario de Gerencia / Staff
  const [staffEmail, setStaffEmail] = useState("");
  const [staffStatus, setStaffStatus] = useState<StatusType>("idle");
  const [staffError, setStaffError] = useState("");

  // Índice del segmento activo (para el indicador deslizante)
  const segIndex = activeTab === "code" ? 0 : activeTab === "doctor" ? 1 : 2;

  // Handler para acceso con código
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setCodeStatus("loading");

    try {
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherCode: code.trim().toUpperCase(),
          mac
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setCodeStatus("success");
        // Redirigir a página de éxito con los datos del usuario
        const successUrl = new URL("/login/success", window.location.origin);
        successUrl.searchParams.set("plan", data.data?.tipo === "TRANSITO" ? "Transito" : "Paciente");
        successUrl.searchParams.set("nombre", data.data?.nombre || "");
        successUrl.searchParams.set("timeLeft", data.data?.expireAt ? calculateTimeLeft(data.data.expireAt) : "permanente");
        if (data.data?.habitacion) {
          successUrl.searchParams.set("habitacion", data.data.habitacion);
        }
        successUrl.searchParams.set("ssid", displaySsid);

        // WISPr: pasar por el login del gateway con las credenciales (RADIUS/Cuenta local)
        if (loginUrl) {
          redirectToWisprLogin(code.trim().toUpperCase(), successUrl.toString());
          return;
        }

        // WiFiDog: pasar por el gateway para que abra el acceso a internet;
        // el gateway luego redirige a la página de éxito (param url).
        if (data.data?.gatewayAuthUrl) {
          window.location.href = `${data.data.gatewayAuthUrl}&url=${encodeURIComponent(successUrl.toString())}`;
          return;
        }

        router.push(successUrl.toString());
      } else {
        setCodeStatus("error");
        setCodeError(data.message || "Código inválido o expirado");
      }
    } catch (err) {
      setCodeStatus("error");
      setCodeError("Error de conexión. Intenta de nuevo.");
    }
  };

  // Handler para acceso de médico
  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setDoctorStatus("loading");

    try {
      const res = await fetch("/api/auth/doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherCode: email.trim(),
          mac
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setDoctorStatus("success");
        // Redirigir a página de éxito
        const successUrl = new URL("/login/success", window.location.origin);
        successUrl.searchParams.set("plan", "Medico");
        successUrl.searchParams.set("nombre", data.data?.nombre || "");
        successUrl.searchParams.set("timeLeft", "permanente");
        successUrl.searchParams.set("ssid", displaySsid);

        // WiFiDog: pasar por el gateway para que abra el acceso a internet
        if (data.data?.gatewayAuthUrl) {
          window.location.href = `${data.data.gatewayAuthUrl}&url=${encodeURIComponent(successUrl.toString())}`;
          return;
        }

        router.push(successUrl.toString());
      } else {
        setDoctorStatus("error");
        setDoctorError(data.message || "Correo no registrado como médico");
      }
    } catch (err) {
      setDoctorStatus("error");
      setDoctorError("Error de conexión. Intenta de nuevo.");
    } finally {
      setDoctorStatus("idle");
    }
  };

  // Handler simulado para acceso de Gerencia / Staff
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail.trim() || !staffEmail.includes("@")) {
      setStaffError("Ingresa un correo institucional válido.");
      return;
    }

    setStaffStatus("loading");
    setStaffError("");

    try {
      const res = await fetch("/api/auth/staff-wifi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: staffEmail.trim(),
          mac
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStaffStatus("success");
        // Redirigir a página de éxito
        const successUrl = new URL("/login/success", window.location.origin);
        successUrl.searchParams.set("plan", "Staff");
        successUrl.searchParams.set("nombre", data.data?.nombre || "");
        successUrl.searchParams.set("timeLeft", "permanente");
        successUrl.searchParams.set("ssid", displaySsid);

        // WiFiDog: pasar por el gateway para que abra el acceso a internet
        if (data.data?.gatewayAuthUrl) {
          window.location.href = `${data.data.gatewayAuthUrl}&url=${encodeURIComponent(successUrl.toString())}`;
          return;
        }

        router.push(successUrl.toString());
      } else {
        setStaffStatus("error");
        setStaffError(data.message || "Error de autenticación.");
      }
    } catch (err) {
      setStaffStatus("error");
      setStaffError("Error de conexión. Intenta de nuevo.");
    } finally {
      setStaffStatus("idle");
    }
  };

  // Helper para calcular tiempo restante
  function calculateTimeLeft(expireAt: string): string {
    const diff = new Date(expireAt).getTime() - Date.now();
    if (diff <= 0) return "expirado";
    const totalMinutes = Math.floor(diff / (1000 * 60));
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }

  return (
    <div className={styles.portal}>
      <div className={styles.aura} aria-hidden="true"><i /><i /><i /></div>

      <div className={styles.stage}>
        <div className={styles.card}>
          {/* Brand cap */}
          <div className={styles.cap}>
            <div className={styles.capRow}>
              <div className={styles.mark}><ShieldPlus /></div>
              <div>
                <b>Clínica IEQ</b>
                <span>Los Mangos</span>
              </div>
            </div>
            <h1 className={styles.capTitle}>
              Conéctate al WiFi
              <small>Elige cómo deseas acceder a la red</small>
            </h1>
          </div>

          {/* Body */}
          <div className={styles.body}>
            {/* Selector de rol (segmented) */}
            <div className={styles.seg} role="tablist" aria-label="Tipo de acceso">
              <span className={styles.segInd} style={{ transform: `translateX(${segIndex * 100}%)` }} />
              <button type="button" role="tab" aria-selected={activeTab === "code"} onClick={() => setActiveTab("code")} className={cn(styles.segBtn, activeTab === "code" && styles.active)}>Paciente</button>
              <button type="button" role="tab" aria-selected={activeTab === "doctor"} onClick={() => setActiveTab("doctor")} className={cn(styles.segBtn, activeTab === "doctor" && styles.active)}>Médico</button>
              <button type="button" role="tab" aria-selected={activeTab === "staff"} onClick={() => setActiveTab("staff")} className={cn(styles.segBtn, activeTab === "staff" && styles.active)}>Personal</button>
            </div>

            {/* Paciente */}
            <div className={cn(styles.mode, activeTab === "code" && styles.show)}>
              <form onSubmit={handleCodeSubmit}>
                <label className={styles.lbl} htmlFor="code">Tu código de acceso</label>
                <div className={styles.field}>
                  <Ticket className={styles.ic} />
                  <input
                    id="code"
                    type="text"
                    inputMode="text"
                    autoCapitalize="characters"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="IEQ-3A7F-B12C"
                    disabled={codeStatus === "loading"}
                    className={cn(styles.input, styles.codeInput)}
                  />
                </div>
                <p className={styles.subhint}>Lo entrega Admisión al registrarte · válido por tu estancia</p>

                {codeStatus === "error" && (
                  <div className={cn(styles.alert, styles.alertError)} role="alert">
                    <AlertCircle />
                    <div>
                      <strong>{codeError || "Código inválido o expirado."}</strong>
                      <p>Solicita un nuevo código en Admisión.</p>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={codeStatus === "loading" || !code.trim()} className={styles.cta}>
                  {codeStatus === "loading" ? (
                    <><span className={styles.spinner} /> Verificando...</>
                  ) : (
                    <>Conectarme <Wifi /></>
                  )}
                </button>
              </form>
            </div>

            {/* Médico */}
            <div className={cn(styles.mode, activeTab === "doctor" && styles.show)}>
              <form onSubmit={handleDoctorSubmit}>
                <label className={styles.lbl} htmlFor="mail">Correo institucional</label>
                <div className={styles.field}>
                  <Mail className={styles.ic} />
                  <input
                    id="mail"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dr.apellido@ieq.com"
                    disabled={doctorStatus === "loading"}
                    className={styles.input}
                  />
                </div>
                <p className={styles.subhint}>Usa tu correo @ieq.com o @ieq.med</p>

                {doctorStatus === "error" && (
                  <div className={cn(styles.alert, styles.alertError)} role="alert">
                    <AlertCircle />
                    <div>
                      <strong>{doctorError || "Correo no registrado como médico."}</strong>
                      <p>Contacta al departamento de Sistemas · Ext. 101.</p>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={doctorStatus === "loading" || !email.trim()} className={styles.cta}>
                  {doctorStatus === "loading" ? (
                    <><span className={styles.spinner} /> Verificando...</>
                  ) : (
                    <>Verificar y conectar <ArrowRight /></>
                  )}
                </button>

                <div className={styles.permanent}>
                  <CheckCircle2 /> Acceso permanente para médicos registrados
                </div>
              </form>
            </div>

            {/* Personal */}
            <div className={cn(styles.mode, activeTab === "staff" && styles.show)}>
              <form onSubmit={handleStaffSubmit}>
                <label className={styles.lbl} htmlFor="smail">Correo institucional</label>
                <div className={styles.field}>
                  <Mail className={styles.ic} />
                  <input
                    id="smail"
                    type="email"
                    inputMode="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="nombre@clinicaieq.com"
                    disabled={staffStatus === "loading"}
                    className={styles.input}
                  />
                </div>
                <p className={styles.subhint}>Personal y gerencia de la clínica</p>

                {staffStatus === "error" && (
                  <div className={cn(styles.alert, styles.alertError)} role="alert">
                    <AlertCircle />
                    <div>
                      <strong>{staffError || "Error de autenticación."}</strong>
                      <p>Verifica tu correo o intenta de nuevo.</p>
                    </div>
                  </div>
                )}
                {staffStatus === "success" && (
                  <div className={cn(styles.alert, styles.alertSuccess)}>
                    <CheckCircle2 />
                    <div>
                      <strong>Acceso concedido.</strong>
                      <p>Redirigiendo para conectarte...</p>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={staffStatus === "loading" || !staffEmail.trim()} className={styles.cta}>
                  {staffStatus === "loading" ? (
                    <><span className={styles.spinner} /> Verificando...</>
                  ) : (
                    <>Verificar y conectar <ArrowRight /></>
                  )}
                </button>
              </form>
            </div>

            {/* Chips de confianza */}
            <div className={styles.trust}>
              <div className={styles.chip}><ShieldCheck /><b>WPA3</b><span>Cifrado</span></div>
              <div className={styles.chip}><Zap /><b>500 Mbps</b><span>Velocidad</span></div>
              <div className={styles.chip}><Clock /><b>06–22h</b><span>Lun–Vie</span></div>
            </div>

            <div className={styles.foot}>
              <span className={styles.dot} /> Red disponible · {displaySsid}
            </div>

            {(mac || ip) && (
              <p className={styles.debug}>
                {mac && <>MAC {mac}</>}{mac && ip ? " · " : ""}{ip && <>IP {ip}</>}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
