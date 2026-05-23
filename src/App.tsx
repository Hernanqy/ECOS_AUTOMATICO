import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./App.css";

type Screen = "home" | "map" | "mission" | "scanner" | "achievements" | "menu";

type ZoneId = "museo" | "lago" | "condorera" | "casona";

type Zone = {
  id: ZoneId;
  label: string;
  title: string;
  mission: string;
  success: string;
  icon: string;
  codes: string[];
};

type GameProgress = {
  currentZoneIndex: number;
  foundCodes: Record<ZoneId, string[]>;
};

const zones: Zone[] = [
  {
    id: "museo",
    label: "Museo",
    title: "Ecos del pasado",
    mission: "Buscá 3 ecos en las salas.",
    success: "¡Museo completo! Ahora sigan hacia el Lago.",
    icon: "/icons/museo.png",
    codes: ["M1", "M2", "M3"]
  },
  {
    id: "lago",
    label: "Lago",
    title: "Ecos del agua",
    mission: "Buscá 3 ecos cerca del agua.",
    success: "¡Lago completo! Ahora sigan hacia La Condorera.",
    icon: "/icons/lago.png",
    codes: ["L1", "L2", "L3"]
  },
  {
    id: "condorera",
    label: "Condorera",
    title: "Ecos del aire",
    mission: "Buscá 3 ecos mirando alto.",
    success: "¡Condorera completa! Ahora vayan hacia La Casona.",
    icon: "/icons/condorera.png",
    codes: ["CO1", "CO2", "CO3"]
  },
  {
    id: "casona",
    label: "Casona",
    title: "Ecos de la casa",
    mission: "Buscá los últimos 3 ecos.",
    success: "¡Completaron Ecos de La Máxima!",
    icon: "/icons/casona.png",
    codes: ["CA1", "CA2", "CA3"]
  }
];

const initialProgress: GameProgress = {
  currentZoneIndex: 0,
  foundCodes: {
    museo: [],
    lago: [],
    condorera: [],
    casona: []
  }
};

function loadProgress(): GameProgress {
  const saved = localStorage.getItem("ecos_progress");

  if (!saved) return initialProgress;

  try {
    return JSON.parse(saved) as GameProgress;
  } catch {
    return initialProgress;
  }
}

function saveProgress(progress: GameProgress) {
  localStorage.setItem("ecos_progress", JSON.stringify(progress));
}

function getCodeFromQR(value: string) {
  const cleanValue = value.trim();

  try {
    const url = new URL(cleanValue);
    const eco = url.searchParams.get("eco") || url.searchParams.get("qr") || "";
    return eco.trim().toUpperCase();
  } catch {
    return cleanValue.toUpperCase();
  }
}

function getInitialQRFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const eco = params.get("eco") || params.get("qr");

  if (!eco) return "";

  return eco.trim().toUpperCase();
}

function clearUrlParams() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function NavIcon({ type }: { type: "inicio" | "mapa" | "eco" | "logros" | "menu" }) {
  if (type === "inicio") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5 15 16 6l11 9" />
        <path d="M9 15v12h14V15" />
      </svg>
    );
  }

  if (type === "mapa") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M4 8l7-3 10 4 7-3v18l-7 3-10-4-7 3V8Z" />
        <path d="M11 5v18" />
        <path d="M21 9v18" />
      </svg>
    );
  }

  if (type === "eco") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="3" />
        <path d="M10 11a8 8 0 0 0 0 10" />
        <path d="M22 11a8 8 0 0 1 0 10" />
        <path d="M6 7a14 14 0 0 0 0 18" />
        <path d="M26 7a14 14 0 0 1 0 18" />
      </svg>
    );
  }

  if (type === "logros") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="m16 4 3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1-7.2-3.8-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2L16 4Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M7 10h18" />
      <path d="M7 16h18" />
      <path d="M7 22h18" />
    </svg>
  );
}

function Header() {
  return (
    <header className="top-brand centered-brand">
      <div className="maxima-brand-box">
        <img src="/logo-la-maxima.png" alt="Polo Educativo y Recreativo La Máxima" />
      </div>
    </header>
  );
}

function BackgroundLines() {
  return (
    <div className="background-lines" aria-hidden="true">
      <svg className="line-dome" viewBox="0 0 180 240">
        <path d="M22 210h120" />
        <path d="M40 210V105" />
        <path d="M128 210V105" />
        <path d="M34 105h102" />
        <path d="M46 105c4-38 28-61 39-61s35 23 39 61" />
        <path d="M85 44V18" />
        <path d="M72 18h26" />
        <path d="M60 210v-66" />
        <path d="M84 210v-66" />
        <path d="M108 210v-66" />
      </svg>

      <svg className="line-bird" viewBox="0 0 160 100">
        <path d="M15 50c28-20 50-22 75-6" />
        <path d="M90 44c18-28 39-36 58-34" />
        <path d="M90 44c15 26 36 38 58 39" />
      </svg>

      <svg className="line-waves" viewBox="0 0 360 120">
        <path d="M0 45c45-28 90 28 135 0s90-28 135 0 60 19 90 0" />
        <path d="M0 75c45-28 90 28 135 0s90-28 135 0 60 19 90 0" />
      </svg>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [progress, setProgress] = useState<GameProgress>(loadProgress);
  const [scanMessage, setScanMessage] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerRunningRef = useRef(false);
  const hasScannedRef = useRef(false);
  const hasProcessedUrlRef = useRef(false);

  const currentZone = zones[progress.currentZoneIndex];
  const currentFound = progress.foundCodes[currentZone.id].length;
  const totalFound = Object.values(progress.foundCodes).reduce((sum, list) => sum + list.length, 0);

  const isExperienceComplete = useMemo(() => {
    return zones.every((zone) => progress.foundCodes[zone.id].length === 3);
  }, [progress]);

  const handleScan = (value: string) => {
    const scannedCode = getCodeFromQR(value);
    const codeZoneIndex = zones.findIndex((zone) => zone.codes.includes(scannedCode));

    if (codeZoneIndex === -1) {
      setScreen("scanner");
      setScanMessage("Este QR no pertenece a la experiencia.");

      setTimeout(() => {
        hasScannedRef.current = false;
        setScanMessage("Probá con otro QR.");
      }, 1700);

      return;
    }

    if (codeZoneIndex > progress.currentZoneIndex) {
      setScreen("scanner");
      setScanMessage("Todavía no llegaste a esta zona.");

      setTimeout(() => {
        hasScannedRef.current = false;
        setScanMessage("Primero completá la zona actual.");
      }, 1700);

      return;
    }

    if (codeZoneIndex < progress.currentZoneIndex) {
      setScreen("scanner");
      setScanMessage("Ese eco ya pertenece a una zona completada.");

      setTimeout(() => {
        setScreen("map");
      }, 1700);

      return;
    }

    const zone = zones[codeZoneIndex];
    const foundInZone = progress.foundCodes[zone.id];

    if (foundInZone.includes(scannedCode)) {
      setScreen("scanner");
      setScanMessage("Este eco ya fue encontrado.");

      setTimeout(() => {
        setScreen("mission");
      }, 1700);

      return;
    }

    const newFoundInZone = [...foundInZone, scannedCode];
    const zoneCompleted = newFoundInZone.length === 3;
    const nextZoneIndex = zoneCompleted
      ? Math.min(progress.currentZoneIndex + 1, zones.length - 1)
      : progress.currentZoneIndex;

    const newProgress: GameProgress = {
      currentZoneIndex: nextZoneIndex,
      foundCodes: {
        ...progress.foundCodes,
        [zone.id]: newFoundInZone
      }
    };

    setProgress(newProgress);
    setScreen("scanner");

    if (zoneCompleted) {
      setScanMessage(zone.success);
    } else {
      setScanMessage(`¡Eco ${scannedCode} encontrado! ${newFoundInZone.length}/3`);
    }

    setTimeout(() => {
      setScreen(zoneCompleted ? "map" : "mission");
    }, 1900);
  };

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (hasProcessedUrlRef.current) return;

    const initialCode = getInitialQRFromUrl();

    if (!initialCode) return;

    hasProcessedUrlRef.current = true;

    setTimeout(() => {
      handleScan(initialCode);
      clearUrlParams();
    }, 300);
  }, []);

  useEffect(() => {
    if (screen !== "scanner") return;

    hasScannedRef.current = false;
    scannerRunningRef.current = false;
    setScanMessage("Apuntá la cámara al QR.");

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1
        },
        (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;
          handleScan(decodedText);
        },
        () => {}
      )
      .then(() => {
        scannerRunningRef.current = true;
      })
      .catch(() => {
        scannerRunningRef.current = false;
        setScanMessage("No se pudo abrir la cámara.");
      });

    return () => {
      const activeScanner = scannerRef.current;

      if (!activeScanner || !scannerRunningRef.current) {
        try {
          activeScanner?.clear();
        } catch {
          // nada
        }

        return;
      }

      scannerRunningRef.current = false;

      activeScanner
        .stop()
        .then(() => {
          activeScanner.clear();
        })
        .catch(() => {
          try {
            activeScanner.clear();
          } catch {
            // nada
          }
        });
    };
  }, [screen]);

  const goToHome = () => setScreen("home");
  const goToMap = () => setScreen("map");
  const goToMission = () => setScreen("mission");
  const goToScanner = () => setScreen("scanner");

  const resetGame = () => {
    localStorage.removeItem("ecos_progress");
    setProgress(initialProgress);
    setScreen("home");
  };

  const simulateScan = () => {
    const missingCode = currentZone.codes.find((code) => !progress.foundCodes[currentZone.id].includes(code));
    if (missingCode) handleScan(missingCode);
  };

  return (
    <main className="app-shell">
      <section className="phone-screen">
        <Header />
        <BackgroundLines />

        {screen === "home" && (
          <>
            <section className="hero-section">
              <div className="title-block">
                <h1>
                  <span>Ecos de</span>
                  <strong>La Máxima</strong>
                </h1>

                <div className="echo-mark" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>

                <p>Explorá el Polo y encontrá los ecos escondidos.</p>
              </div>

              <div className="guide-wrap">
                <div className="speech-bubble">
                  <strong>¡Hola!</strong>
                  <span>Soy tu guía.</span>
                </div>

                <img className="guide-character" src="/personaje.png" alt="Guía de la experiencia" />
              </div>
            </section>

            <section className="route-card">
              <div className="route-path" aria-hidden="true">
                <svg viewBox="0 0 760 120" preserveAspectRatio="none">
                  <path d="M78 67 C160 20, 214 110, 292 67 S432 20, 510 67 S650 110, 730 67" />
                </svg>
              </div>

              <div className="route-grid">
                {zones.map((item) => (
                  <div className="route-item" key={item.id}>
                    <div className="zone-icon">
                      <img src={item.icon} alt={item.label} />
                    </div>
                    <span className="route-dot" />
                    <strong>{item.label}</strong>
                  </div>
                ))}
              </div>

              <button className="start-button" onClick={goToMap}>
                <span>Comenzar</span>
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <path d="M8 20h22" />
                  <path d="m22 11 9 9-9 9" />
                </svg>
              </button>
            </section>
          </>
        )}

        {screen === "map" && (
          <section className="page-section">
            <div className="page-title">
              <span>Recorrido</span>
              <h2>Mapa de misión</h2>
              <p>Completá cada zona para avanzar.</p>
            </div>

            <div className="map-list">
              {zones.map((zone, index) => {
                const isActive = index === progress.currentZoneIndex;
                const isDone = progress.foundCodes[zone.id].length === 3;
                const isLocked = index > progress.currentZoneIndex;

                return (
                  <button
                    className={`map-item ${isActive ? "active" : ""} ${isDone ? "done" : ""} ${isLocked ? "locked" : ""}`}
                    key={zone.id}
                    disabled={isLocked}
                    onClick={() => {
                      if (!isLocked) {
                        setProgress({ ...progress, currentZoneIndex: index });
                        setScreen("mission");
                      }
                    }}
                  >
                    <div className="map-icon">
                      <img src={zone.icon} alt="" />
                    </div>

                    <div className="map-info">
                      <strong>{zone.label}</strong>
                      <span>{isDone ? "Completado" : isActive ? "Disponible" : "Bloqueado"}</span>
                    </div>

                    <div className="map-state">
                      {isDone ? "✓" : isActive ? "→" : "×"}
                    </div>
                  </button>
                );
              })}
            </div>

            <button className="start-button compact" onClick={goToMission}>
              <span>Ir a misión</span>
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <path d="M8 20h22" />
                <path d="m22 11 9 9-9 9" />
              </svg>
            </button>
          </section>
        )}

        {screen === "mission" && (
          <section className="page-section">
            <div className="mission-card">
              <div className="mission-icon">
                <img src={currentZone.icon} alt={currentZone.label} />
              </div>

              <span className="mission-kicker">Zona {progress.currentZoneIndex + 1} de 4</span>
              <h2>{currentZone.label}</h2>
              <h3>{currentZone.title}</h3>
              <p>{isExperienceComplete ? "La experiencia está completa." : currentZone.mission}</p>

              <div className="progress-card">
                <strong>{currentFound}/3</strong>
                <span>ecos encontrados</span>
              </div>

              {!isExperienceComplete && currentFound < 3 && (
                <button className="scan-button" onClick={goToScanner}>
                  Escanear QR
                </button>
              )}

              {currentFound === 3 && !isExperienceComplete && (
                <div className="success-panel">
                  <strong>¡Zona completa!</strong>
                  <span>{zones[Math.max(progress.currentZoneIndex - 1, 0)].success}</span>
                </div>
              )}

              {isExperienceComplete && (
                <div className="success-panel">
                  <strong>¡Final completado!</strong>
                  <span>Gracias por recorrer Ecos de La Máxima.</span>
                </div>
              )}

              <button className="secondary-button" onClick={goToMap}>
                Ver mapa
              </button>
            </div>
          </section>
        )}

        {screen === "scanner" && (
          <section className="page-section">
            <div className="page-title">
              <span>Escáner</span>
              <h2>Buscar eco</h2>
              <p>Zona activa: {currentZone.label}</p>
            </div>

            <div className="scanner-card">
              <div id="qr-reader" />
              <div className="scan-message">{scanMessage}</div>
            </div>

            <button className="secondary-button" onClick={goToMission}>
              Cancelar
            </button>

            <button className="dev-button" onClick={simulateScan}>
              Simular QR
            </button>
          </section>
        )}

        {screen === "achievements" && (
          <section className="page-section">
            <div className="page-title">
              <span>Logros</span>
              <h2>Tus ecos</h2>
              <p>{totalFound}/12 ecos encontrados.</p>
            </div>

            <div className="achievement-grid">
              {zones.map((zone) => (
                <div className="achievement-card" key={zone.id}>
                  <img src={zone.icon} alt="" />
                  <strong>{zone.label}</strong>
                  <span>{progress.foundCodes[zone.id].length}/3</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {screen === "menu" && (
          <section className="page-section">
            <div className="page-title">
              <span>Menú</span>
              <h2>Opciones</h2>
              <p>Configuración básica de la experiencia.</p>
            </div>

            <button className="menu-button" onClick={goToHome}>Volver al inicio</button>
            <button className="menu-button" onClick={goToMap}>Ver recorrido</button>
            <button className="danger-button" onClick={resetGame}>Reiniciar juego</button>
          </section>
        )}

        <nav className="bottom-nav" aria-label="Navegación principal">
          <button className={`nav-item ${screen === "home" ? "active" : ""}`} onClick={goToHome}>
            <NavIcon type="inicio" />
            <span>Inicio</span>
          </button>

          <button className={`nav-item ${screen === "map" ? "active" : ""}`} onClick={goToMap}>
            <NavIcon type="mapa" />
            <span>Mapa</span>
          </button>

          <button className="scan-nav" onClick={goToScanner}>
            <NavIcon type="eco" />
          </button>

          <button className={`nav-item ${screen === "achievements" ? "active" : ""}`} onClick={() => setScreen("achievements")}>
            <NavIcon type="logros" />
            <span>Logros</span>
          </button>

          <button className={`nav-item ${screen === "menu" ? "active" : ""}`} onClick={() => setScreen("menu")}>
            <NavIcon type="menu" />
            <span>Menú</span>
          </button>
        </nav>
      </section>
    </main>
  );
}

export default App;
