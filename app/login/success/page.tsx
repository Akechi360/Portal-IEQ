"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  BedDouble,
  Clock,
  Smartphone,
  User,
  Stethoscope,
  Wifi,
  AlertCircle,
  ExternalLink,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/styles";
import styles from "./success.module.css";

// app/login/success/page.tsx
// Página de éxito compartida para todos los tipos de acceso WiFi.
// Confirma la conexión a la red de la Clínica IEQ.

function SuccessContent() {
  const searchParams = useSearchParams();

  const ssid = searchParams?.get("ssid") || "WiFi Clinica IEQ Los Mangos";
  const plan = searchParams?.get("plan");
  const nombre = searchParams?.get("nombre");
  const devicesUsed = searchParams?.get("devicesUsed");
  const maxDevices = searchParams?.get("maxDevices");
  const timeLeft = searchParams?.get("timeLeft");
  const habitacion = searchParams?.get("habitacion");

  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // El gateway puede mandar el nombre de VLAN en lugar del SSID real
  const displaySsid = /^vlan/i.test(ssid) ? "WiFi Clinica IEQ Los Mangos" : ssid;

  return (
    <div className={styles.portal}>
      <div className={styles.aura} aria-hidden="true"><i /><i /><i /></div>

      <div className={styles.stage}>
        <div className={styles.card}>
          {/* Hero de éxito */}
          <div className={styles.hero}>
            <div className={cn(styles.check, animate && styles.checkPop)}>
              <CheckCircle2 />
            </div>
            <h1>¡Acceso concedido!</h1>
            <p>Ya estás conectado a <b>{displaySsid}</b></p>
          </div>

          {/* Detalle según plan */}
          <div className={styles.body}>
            <div className={styles.rows}>
              {plan === "Paciente" && (
                <>
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><User /> Paciente</span>
                    <span className={styles.rowVal}>{nombre || "Paciente"}</span>
                  </div>
                  {habitacion && (
                    <div className={styles.row}>
                      <span className={styles.rowLeft}><BedDouble /> Habitación</span>
                      <span className={styles.rowVal}>{habitacion}</span>
                    </div>
                  )}
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><Clock /> Tiempo disponible</span>
                    <span className={styles.rowVal}>{timeLeft}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><Smartphone /> Dispositivos</span>
                    <span className={styles.rowVal}>{devicesUsed || 1} de {maxDevices || 4} conectados</span>
                  </div>
                </>
              )}

              {plan === "Medico" && (
                <>
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><Stethoscope /> Médico</span>
                    <span className={styles.rowVal}>{nombre || "Personal médico"}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><Clock /> Tipo de acceso</span>
                    <span className={styles.badgePerm}>Permanente</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><Wifi /> Red asignada</span>
                    <span className={styles.rowVal}>{displaySsid}</span>
                  </div>
                </>
              )}

              {plan === "Staff" && (
                <>
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><Building2 /> Personal</span>
                    <span className={styles.rowVal}>{nombre || "Personal / Gerencia"}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><Clock /> Tipo de acceso</span>
                    <span className={styles.badgePerm}>Permanente</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><Wifi /> Red asignada</span>
                    <span className={styles.rowVal}>{displaySsid}</span>
                  </div>
                </>
              )}

              {plan === "Transito" && (
                <>
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><User /> Visitante</span>
                    <span className={styles.rowVal}>{nombre || "Tránsito"}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><Clock /> Tiempo disponible</span>
                    <span className={styles.rowVal}>{timeLeft || "30 minutos"}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLeft}><Smartphone /> Dispositivos</span>
                    <span className={styles.rowVal}>1 dispositivo</span>
                  </div>
                </>
              )}
            </div>

            {plan === "Transito" && (
              <div className={styles.warn}>
                <AlertCircle />
                <span>El acceso expira al finalizar el tiempo asignado.</span>
              </div>
            )}

            <button className={styles.cta} onClick={() => (window.location.href = "https://www.clinicaieq.com")}>
              <ExternalLink /> Ir a www.clinicaieq.com
            </button>
            <p className={styles.secondary}>Puedes cerrar esta ventana en cualquier momento.</p>

            <div className={styles.foot}>
              <span className={styles.dot} /> Conectado a {displaySsid}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Suspense evita errores de hidratación con useSearchParams en App Router.
export default function SuccessPage() {
  return (
    <Suspense fallback={<div className={styles.portal} />}>
      <SuccessContent />
    </Suspense>
  );
}
