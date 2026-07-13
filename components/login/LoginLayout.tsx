import { Shield, Zap, Clock, Infinity as InfinityIcon, Users } from "lucide-react";
import styles from "./loginlayout.module.css";

interface LoginLayoutProps {
  leftColor?: string; // legado, ya no se usa (el panel siempre es teal de marca)
  leftTitle: string;
  leftDescription: string;
  leftFeatures: Array<{
    icon: "shield" | "zap" | "clock" | "infinity" | "users";
    bold: string;
    text: string;
  }>;
  badgeSSID: string;
  badgePrefix?: string;
  badgeTheme?: "green" | "slate";
  footerText?: string;
  children: React.ReactNode;
}

const ICONS = { shield: Shield, zap: Zap, clock: Clock, infinity: InfinityIcon, users: Users };

export function LoginLayout({
  leftTitle,
  leftDescription,
  leftFeatures,
  badgeSSID,
  badgePrefix = "Red disponible",
  footerText = "© 2026 IEQ - Todos los derechos reservados",
  children,
}: LoginLayoutProps) {
  const [line1, line2] = leftTitle.split("\\n");
  const badgeLabel = `${badgePrefix}${badgePrefix ? " · " : ""}${badgeSSID}`;

  return (
    <div className={styles.shell}>
      {/* Brand panel */}
      <aside className={styles.brand}>
        <div className={styles.aura} aria-hidden="true"><i /><i /></div>
        <div className={styles.rings} aria-hidden="true"><i /><i /></div>

        <div className={styles.brandInner}>
          <div className={styles.logoRow}>
            <img src="/logo-ieq.png" alt="IEQ" className={styles.logoImg} />
            <div className={styles.logoTxt}>
              <b>Portal IEQ</b>
              <span>Control de acceso WiFi</span>
            </div>
            <div className={styles.badgeTablet}>
              <span className={styles.dotPulse} /> {badgeLabel}
            </div>
          </div>

          <div className={styles.hero}>
            <span className={styles.eyebrow}><span className={styles.dot} /> Acceso interno</span>
            <h1 className={styles.title}>
              {line1}
              {line2 && <><br />{line2}</>}
            </h1>
            <p className={styles.desc}>{leftDescription}</p>

            {leftFeatures.length > 0 && (
              <ul className={styles.features}>
                {leftFeatures.map((feat, idx) => {
                  const Icon = ICONS[feat.icon];
                  return (
                    <li key={idx}>
                      <span className={styles.featIc}><Icon /></span>
                      <span><b>{feat.bold}</b> <span className={styles.muted}>{feat.text}</span></span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className={styles.brandFoot}>
            <span className={styles.footText}>{footerText}</span>
            <span className={styles.badgeDesktop}>
              <span className={styles.dotPulse} /> {badgeLabel}
            </span>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <section className={styles.formSide}>
        <div className={styles.formCard}>{children}</div>
      </section>
    </div>
  );
}
