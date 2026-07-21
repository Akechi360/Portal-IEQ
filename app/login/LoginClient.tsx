// app/login/LoginClient.tsx
// Componente client-side del portal cautivo único
// Maneja el selector entre "Acceso con código", "Soy médico" y "Personal"

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Mail, Wifi, ArrowRight, CheckCircle2, ShieldCheck, ShieldPlus, Zap, Clock, X } from "lucide-react";
import { cn } from "@/lib/styles";
import { alertMessage } from "@/lib/alerts";
import styles from "./login.module.css";

interface LoginClientProps {
  mac: string;
  redirect: string;
  ssid: string;
  loginUrl?: string;
  logoutUrl?: string;
}

type TabType = "code" | "doctor" | "staff";
type StatusType = "idle" | "loading" | "success" | "error";

export function LoginClient({ mac, redirect, ssid, loginUrl = "", logoutUrl = "" }: LoginClientProps) {
  const router = useRouter();
  // El gateway manda identificadores internos (VLAN233, auto_192168110101…),
  // NUNCA el nombre real. Mostramos siempre el nombre amigable de la red.
  const looksReal = ssid ? /clinica|ieq/i.test(ssid) && !/^(vlan|auto)/i.test(ssid) : false;
  const displaySsid = looksReal ? ssid : "WiFi Clinica IEQ Los Mangos";

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

  // Términos y aviso de privacidad
  const [showTerms, setShowTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  // Formulario de código (PACIENTE / TRANSITO)
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<StatusType>("idle");

  // Formulario de médico
  const [email, setEmail] = useState("");
  const [doctorStatus, setDoctorStatus] = useState<StatusType>("idle");

  // Formulario de Gerencia / Staff
  const [staffEmail, setStaffEmail] = useState("");
  const [staffStatus, setStaffStatus] = useState<StatusType>("idle");

  // Índice del segmento activo (para el indicador deslizante)
  const segIndex = activeTab === "code" ? 0 : activeTab === "doctor" ? 1 : 2;

  // Diálogo de error de acceso, con guía según el tipo de usuario:
  // paciente -> pedir en Admisión; médico/personal -> pedir en Sistemas.
  const showAccessError = (tipo: "paciente" | "medico" | "personal", serverMsg?: string) => {
    const donde = tipo === "paciente" ? "Admisión" : "Sistemas";
    const que = tipo === "paciente" ? "tu código de acceso" : "tu correo";
    alertMessage({
      icon: "warning",
      title: "No pudimos darte acceso",
      html:
        (serverMsg ? `${serverMsg}<br/><br/>` : "") +
        `Revisa que <b>${que}</b> esté bien escrito. Si aún no tienes acceso, ` +
        `solicítalo en <b>${donde}</b>.`,
    });
  };

  const showConnectionError = () => {
    alertMessage({
      icon: "error",
      title: "Error de conexión",
      text: "No pudimos conectar con el servidor. Intenta de nuevo en un momento.",
    });
  };

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
        setCodeStatus("idle");
        showAccessError("paciente", data.message);
      }
    } catch (err) {
      setCodeStatus("idle");
      showConnectionError();
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

        // WISPr: pasar por el login del gateway con el correo como credencial
        // (RADIUS lo valida contra la tabla Doctor). Sin esto el gateway nunca
        // abre internet aunque el portal muestre "acceso concedido".
        if (loginUrl) {
          redirectToWisprLogin(email.trim(), successUrl.toString());
          return;
        }

        // WiFiDog: pasar por el gateway para que abra el acceso a internet
        if (data.data?.gatewayAuthUrl) {
          window.location.href = `${data.data.gatewayAuthUrl}&url=${encodeURIComponent(successUrl.toString())}`;
          return;
        }

        router.push(successUrl.toString());
      } else {
        setDoctorStatus("idle");
        showAccessError("medico", data.message);
      }
    } catch (err) {
      setDoctorStatus("idle");
      showConnectionError();
    }
  };

  // Handler para acceso de Gerencia / Staff
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmail.trim() || !staffEmail.includes("@")) {
      showAccessError("personal");
      return;
    }

    setStaffStatus("loading");

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

        // WISPr: pasar por el login del gateway con el correo como credencial
        // (RADIUS lo valida contra la tabla StaffUser). Sin esto el gateway
        // nunca abre internet aunque el portal muestre "acceso concedido".
        if (loginUrl) {
          redirectToWisprLogin(staffEmail.trim(), successUrl.toString());
          return;
        }

        // WiFiDog: pasar por el gateway para que abra el acceso a internet
        if (data.data?.gatewayAuthUrl) {
          window.location.href = `${data.data.gatewayAuthUrl}&url=${encodeURIComponent(successUrl.toString())}`;
          return;
        }

        router.push(successUrl.toString());
      } else {
        setStaffStatus("idle");
        showAccessError("personal", data.message);
      }
    } catch (err) {
      setStaffStatus("idle");
      showConnectionError();
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
                <label className={styles.lbl} htmlFor="mail">Tu correo registrado</label>
                <div className={styles.field}>
                  <Mail className={styles.ic} />
                  <input
                    id="mail"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dr.perez@gmail.com"
                    disabled={doctorStatus === "loading"}
                    className={styles.input}
                  />
                </div>
                <p className={styles.subhint}>El correo que registró Sistemas (Gmail, Outlook, etc.)</p>

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
              <div className={styles.chip}><Zap /><b>600 Mbps</b><span>Velocidad</span></div>
              <div className={styles.chip}><Clock /><b>24/7</b><span>Disponible</span></div>
            </div>

            <div className={styles.foot}>
              <span className={styles.dot} /> Red disponible · {displaySsid}
            </div>

            <p className={styles.legal}>
              Al conectarte aceptas los{" "}
              <button type="button" className={styles.legalLink} onClick={() => setShowTerms(true)}>
                Términos y el Aviso de Privacidad
              </button>.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Términos y Aviso de Privacidad */}
      {showTerms && (
        <div className={styles.modalOverlay} onClick={() => setShowTerms(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Términos y Aviso de Privacidad">
            <div className={styles.modalHead}>
              <h2>Términos y Aviso de Privacidad</h2>
              <button type="button" className={styles.modalClose} onClick={() => setShowTerms(false)} aria-label="Cerrar">
                <X />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p>
                Clínica IEQ Los Mangos pone a tu disposición esta red WiFi de cortesía. Al
                conectarte, aceptas los presentes términos y el tratamiento de tus datos que
                aquí se describe, conforme a la legislación venezolana.
              </p>

              <h4>1. Datos que recopilamos</h4>
              <p>Para operar y proteger la red registramos datos técnicos de la conexión:</p>
              <ul>
                <li>Dirección MAC e IP del dispositivo.</li>
                <li>Fecha, hora y duración de las sesiones.</li>
                <li>Volumen de datos consumidos y red (SSID) utilizada.</li>
                <li>Correo institucional o código de acceso con el que te autenticas.</li>
              </ul>

              <h4>2. Finalidad</h4>
              <p>
                Usamos estos datos únicamente para brindar el servicio de acceso a Internet,
                garantizar la seguridad de la red, prevenir usos indebidos y cumplir con las
                obligaciones legales aplicables.
              </p>

              <h4>3. Base legal y tus derechos</h4>
              <p>
                El tratamiento se realiza conforme al artículo 28 de la Constitución de la
                República Bolivariana de Venezuela (derecho de acceso y protección de datos) y
                demás normativa vigente. Puedes solicitar el acceso, rectificación o supresión
                de tus datos escribiendo al departamento de Sistemas de la clínica.
              </p>

              <h4>4. Conservación</h4>
              <p>
                Los registros de conexión se conservan por el tiempo necesario para los fines
                indicados y luego se eliminan o anonimizan.
              </p>

              <h4>5. Comunicaciones y marketing</h4>
              <p>
                Si nos proporcionas un correo, podremos enviarte información institucional y
                promociones de los servicios de Clínica IEQ Los Mangos, solo si lo autorizas a
                continuación. Puedes revocar esta autorización en cualquier momento.
              </p>
              <label className={styles.modalConsent}>
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                />
                <span>
                  Autorizo el uso de mis datos de contacto para recibir información y
                  promociones de Clínica IEQ Los Mangos. (Opcional)
                </span>
              </label>
            </div>

            <div className={styles.modalFoot}>
              <button type="button" className={styles.modalBtn} onClick={() => setShowTerms(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
