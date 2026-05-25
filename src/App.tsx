import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type Screen = "home" | "map" | "mission" | "scanner" | "orientation" | "achievements" | "menu";

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

type SoundType = "launch" | "found" | "duplicate" | "zone" | "final";

const zones: Zone[] = [
  {
    id: "museo",
    label: "Museo",
    title: "Ecos del pasado",
    mission: "Buscá 2 ecos en las salas.",
    success: "¡Museo completo! Ahora seguí hacia el Lago.",
    icon: "/icons/museo.png",
    codes: ["M1", "M2"]
  },
  {
    id: "lago",
    label: "Lago",
    title: "Ecos del agua",
    mission: "Buscá 2 ecos cerca del agua.",
    success: "¡Lago completo! Ahora seguí hacia La Condorera.",
    icon: "/icons/lago.png",
    codes: ["L1", "L2"]
  },
  {
    id: "condorera",
    label: "Condorera",
    title: "Ecos del aire",
    mission: "Buscá 2 ecos mirando alto.",
    success: "¡Condorera completa! Ahora seguí hacia La Casona.",
    icon: "/icons/condorera.png",
    codes: ["CO1", "CO2"]
  },
  {
    id: "casona",
    label: "Casona",
    title: "Ecos de la casa",
    mission: "Buscá los últimos 2 ecos.",
    success: "¡Completaron Ecos de La Máxima!",
    icon: "/icons/casona.png",
    codes: ["CA1", "CA2"]
  }
];

const validCodes = zones.flatMap((zone) => zone.codes);

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
    const parsed = JSON.parse(saved) as GameProgress;

    if (!parsed.foundCodes) return initialProgress;

    return {
      currentZoneIndex: parsed.currentZoneIndex ?? 0,
      foundCodes: {
        museo: parsed.foundCodes.museo ?? [],
        lago: parsed.foundCodes.lago ?? [],
        condorera: parsed.foundCodes.condorera ?? [],
        casona: parsed.foundCodes.casona ?? []
      }
    };
  } catch {
    return initialProgress;
  }
}

function saveProgress(progress: GameProgress) {
  localStorage.setItem("ecos_progress", JSON.stringify(progress));
}

function extractValidCode(text: string) {
  const rawText = String(text || "").trim();
  const upperText = rawText.toUpperCase();
  const compactText = upperText.replace(/[^A-Z0-9]/g, "");
  const orderedCodes = [...validCodes].sort((a, b) => b.length - a.length);

  for (const code of orderedCodes) {
    if (upperText === code) return code;
  }

  try {
    const url = new URL(rawText);
    const eco =
      url.searchParams.get("eco") ||
      url.searchParams.get("ECO") ||
      url.searchParams.get("qr") ||
      url.searchParams.get("QR") ||
      "";

    const compactEco = eco.toUpperCase().replace(/[^A-Z0-9]/g, "");

    for (const code of orderedCodes) {
      if (compactEco === code || compactEco.includes(code)) {
        return code;
      }
    }
  } catch {
    // No era URL.
  }

  for (const code of orderedCodes) {
    if (compactText.includes(code)) {
      return code;
    }
  }

  return "";
}

function getCodeFromQR(value: string) {
  const code = extractValidCode(value);

  if (code) return code;

  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function getInitialQRFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const eco = params.get("eco") || params.get("qr");

  if (!eco) return "";

  return getCodeFromQR(eco);
}

function clearUrlParams() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function getOrientationImage(completedZoneIndex: number) {
  if (completedZoneIndex === 0) return "/mapa-museo-lago.png";
  if (completedZoneIndex === 1) return "/mapa-lago-condorera.png";
  if (completedZoneIndex === 2) return "/mapa-condorera-casona.png";
  return "/mapa-final.png";
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

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [progress, setProgress] = useState<GameProgress>(loadProgress);
  const [scanMessage, setScanMessage] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [scannerSession, setScannerSession] = useState(0);
  const [completedZoneForMap, setCompletedZoneForMap] = useState<number | null>(null);

  const scannerRef = useRef<any>(null);
  const scannerRunningRef = useRef(false);
  const qrReadRef = useRef(false);
  const hasProcessedUrlRef = useRef(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef(false);
  const launchSoundPlayedRef = useRef(false);

  const currentZone = zones[progress.currentZoneIndex];
  const currentFound = progress.foundCodes[currentZone.id].length;
  const currentRequired = currentZone.codes.length;
  const totalFound = Object.values(progress.foundCodes).reduce((sum, list) => sum + list.length, 0);
  const totalRequired = zones.reduce((sum, zone) => sum + zone.codes.length, 0);

  const isExperienceComplete = useMemo(() => {
    return zones.every((zone) => progress.foundCodes[zone.id].length === zone.codes.length);
  }, [progress]);

  function clearTransitionTimeout() {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }

  function getAudioContext() {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    return audioContextRef.current;
  }

  function playTone(frequency: number, start: number, duration: number, volume = 0.08, type: OscillatorType = "sine") {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + start);

    gain.gain.setValueAtTime(0, ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(ctx.currentTime + start);
    oscillator.stop(ctx.currentTime + start + duration + 0.02);
  }

  async function unlockAudio() {
    try {
      const ctx = getAudioContext();

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      audioUnlockedRef.current = true;

      if (!launchSoundPlayedRef.current) {
        launchSoundPlayedRef.current = true;
        playSound("launch");
      }
    } catch {
      // Nada.
    }
  }

  function playSound(type: SoundType) {
    try {
      if (!audioUnlockedRef.current && type !== "launch") return;

      if (type === "launch") {
        playTone(440, 0, 0.12, 0.07, "sine");
        playTone(660, 0.12, 0.14, 0.07, "sine");
        playTone(880, 0.26, 0.18, 0.06, "triangle");
      }

      if (type === "found") {
        playTone(660, 0, 0.09, 0.08, "triangle");
        playTone(880, 0.09, 0.12, 0.08, "triangle");
      }

      if (type === "duplicate") {
        playTone(240, 0, 0.13, 0.07, "sawtooth");
        playTone(180, 0.13, 0.16, 0.06, "sawtooth");
      }

      if (type === "zone") {
        playTone(523, 0, 0.1, 0.08, "triangle");
        playTone(659, 0.11, 0.1, 0.08, "triangle");
        playTone(784, 0.22, 0.16, 0.08, "triangle");
        playTone(1046, 0.39, 0.24, 0.06, "sine");
      }

      if (type === "final") {
        playTone(523, 0, 0.13, 0.08, "triangle");
        playTone(659, 0.14, 0.13, 0.08, "triangle");
        playTone(784, 0.28, 0.13, 0.08, "triangle");
        playTone(1046, 0.43, 0.2, 0.08, "triangle");
        playTone(1318, 0.66, 0.32, 0.06, "sine");
      }
    } catch {
      // Nada.
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current;

    if (!scanner) {
      scannerRunningRef.current = false;
      qrReadRef.current = false;
      return;
    }

    try {
      if (scannerRunningRef.current) {
        await scanner.stop();
      }
    } catch {
      // Nada.
    }

    try {
      await scanner.clear();
    } catch {
      // Nada.
    }

    scannerRef.current = null;
    scannerRunningRef.current = false;
    qrReadRef.current = false;
  }

  const handleScan = (value: string) => {
    clearTransitionTimeout();

    const scannedCode = getCodeFromQR(value);
    const codeZoneIndex = zones.findIndex((zone) => zone.codes.includes(scannedCode));

    if (codeZoneIndex === -1) {
      playSound("duplicate");
      setScreen("scanner");
      setScanMessage(`No reconocido: ${scannedCode}`);

      transitionTimeoutRef.current = window.setTimeout(() => {
        transitionTimeoutRef.current = null;
        qrReadRef.current = false;
        setScanMessage("Probá con otro QR.");
      }, 2500);

      return;
    }

    if (codeZoneIndex > progress.currentZoneIndex) {
      playSound("duplicate");
      setScreen("scanner");
      setScanMessage("Primero completá la zona actual.");

      transitionTimeoutRef.current = window.setTimeout(() => {
        transitionTimeoutRef.current = null;
        qrReadRef.current = false;
        setScanMessage("Apuntá la cámara al QR.");
      }, 2200);

      return;
    }

    if (codeZoneIndex < progress.currentZoneIndex) {
      playSound("duplicate");
      setScreen("scanner");
      setScanMessage("Ese eco ya pertenece a una zona completada.");

      transitionTimeoutRef.current = window.setTimeout(() => {
        transitionTimeoutRef.current = null;
        setScreen("map");
      }, 1700);

      return;
    }

    const zone = zones[codeZoneIndex];
    const foundInZone = progress.foundCodes[zone.id];

    if (foundInZone.includes(scannedCode)) {
      playSound("duplicate");
      setScreen("scanner");
      setScanMessage("Este eco ya fue encontrado.");

      transitionTimeoutRef.current = window.setTimeout(() => {
        transitionTimeoutRef.current = null;
        setScreen("mission");
      }, 1700);

      return;
    }

    const newFoundInZone = [...foundInZone, scannedCode];
    const zoneCompleted = newFoundInZone.length === zone.codes.length;

    const newProgress: GameProgress = {
      currentZoneIndex: zoneCompleted
        ? Math.min(progress.currentZoneIndex + 1, zones.length - 1)
        : progress.currentZoneIndex,
      foundCodes: {
        ...progress.foundCodes,
        [zone.id]: newFoundInZone
      }
    };

    const completedAllZones = zones.every((item) => {
      if (item.id === zone.id) return newFoundInZone.length === item.codes.length;
      return newProgress.foundCodes[item.id].length === item.codes.length;
    });

    if (completedAllZones) {
      playSound("final");
    } else if (zoneCompleted) {
      playSound("zone");
    } else {
      playSound("found");
    }

    setProgress(newProgress);
    setScreen("scanner");

    if (completedAllZones) {
      setScanMessage("¡Completaron Ecos de La Máxima!");
    } else if (zoneCompleted) {
      setScanMessage(zone.success);
    } else {
      setScanMessage(`¡Eco encontrado! ${newFoundInZone.length}/${zone.codes.length}`);
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      transitionTimeoutRef.current = null;

      if (completedAllZones) {
        setCompletedZoneForMap(3);
        setScreen("orientation");
        return;
      }

      if (zoneCompleted) {
        setCompletedZoneForMap(codeZoneIndex);
        setScreen("orientation");
        return;
      }

      setScreen("mission");
    }, zoneCompleted ? 2500 : 1500);
  };

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    const activateAudio = () => {
      unlockAudio();
    };

    window.addEventListener("pointerdown", activateAudio, { once: true });
    window.addEventListener("touchstart", activateAudio, { once: true });
    window.addEventListener("click", activateAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", activateAudio);
      window.removeEventListener("touchstart", activateAudio);
      window.removeEventListener("click", activateAudio);
    };
  }, []);

  useEffect(() => {
    if (hasProcessedUrlRef.current) return;

    const initialCode = getInitialQRFromUrl();

    if (!initialCode) return;

    hasProcessedUrlRef.current = true;

    transitionTimeoutRef.current = window.setTimeout(() => {
      transitionTimeoutRef.current = null;
      handleScan(initialCode);
      clearUrlParams();
    }, 300);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      if (screen !== "scanner") {
        await stopScanner();
        return;
      }

      if (scannerRunningRef.current || scannerRef.current) return;

      setManualCode("");
      setScanMessage("Apuntá la cámara al QR.");

      const readerId = `qr-reader-${scannerSession}`;
      const readerElement = document.getElementById(readerId);

      if (!readerElement) return;

      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (cancelled) return;

        const scanner = new Html5Qrcode(readerId);

        scannerRef.current = scanner;
        qrReadRef.current = false;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1
          },
          async (decodedText: string) => {
            if (qrReadRef.current) return;

            qrReadRef.current = true;
            setScanMessage("QR detectado. Validando...");

            await stopScanner();
            handleScan(decodedText);
          },
          () => {}
        );

        scannerRunningRef.current = true;
      } catch {
        setScanMessage("No se pudo abrir la cámara.");
        scannerRef.current = null;
        scannerRunningRef.current = false;
        qrReadRef.current = false;
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [screen, progress.currentZoneIndex, scannerSession]);

  const goToHome = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("home");
  };

  const goToMap = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("map");
  };

  const goToMission = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("mission");
  };

  const goToScanner = async () => {
    clearTransitionTimeout();
    await unlockAudio();
    await stopScanner();
    qrReadRef.current = false;
    scannerRunningRef.current = false;
    scannerRef.current = null;
    setScannerSession((value) => value + 1);
    setScreen("scanner");
  };

  const goFromOrientation = () => {
    clearTransitionTimeout();
    unlockAudio();

    if (isExperienceComplete) {
      setScreen("achievements");
      return;
    }

    setScreen("mission");
  };

  const resetGame = () => {
    clearTransitionTimeout();
    stopScanner();
    localStorage.removeItem("ecos_progress");
    setCompletedZoneForMap(null);
    setProgress(initialProgress);
    setScreen("home");
  };

  const simulateScan = () => {
    const missingCode = currentZone.codes.find((code) => !progress.foundCodes[currentZone.id].includes(code));
    if (missingCode) handleScan(missingCode);
  };

  const submitManualCode = () => {
    if (!manualCode.trim()) return;
    handleScan(manualCode);
  };

  const orientationZoneIndex = completedZoneForMap ?? Math.max(progress.currentZoneIndex - 1, 0);
  const orientationImage = getOrientationImage(orientationZoneIndex);
  const completedLabel = zones[orientationZoneIndex]?.label ?? "Recorrido";
  const nextLabel = zones[orientationZoneIndex + 1]?.label ?? "Final";

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
                const isDone = progress.foundCodes[zone.id].length === zone.codes.length;
                const isLocked = index > progress.currentZoneIndex;

                return (
                  <button
                    className={`map-item ${isActive ? "active" : ""} ${isDone ? "done" : ""} ${isLocked ? "locked" : ""}`}
                    key={zone.id}
                    disabled={isLocked}
                    onClick={() => {
                      if (!isLocked) {
                        clearTransitionTimeout();
                        unlockAudio();
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

        {screen === "orientation" && (
          <section className="page-section orientation-section">
            <div className="page-title">
              <span>Orientación</span>
              <h2>{isExperienceComplete ? "Misión cumplida" : `${completedLabel} completo`}</h2>
              <p>{isExperienceComplete ? "Completaste todos los ecos." : `Ahora seguí hacia ${nextLabel}.`}</p>
            </div>

            <div className="orientation-map-card">
              <img src={orientationImage} alt="Mapa de orientación" />
            </div>

            <button className="start-button compact" onClick={goFromOrientation}>
              <span>{isExperienceComplete ? "Ver logros" : `Ir a ${nextLabel}`}</span>
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
                <strong>{currentFound}/{currentRequired}</strong>
                <span>ecos encontrados</span>
              </div>

              {!isExperienceComplete && currentFound < currentRequired && (
                <button className="scan-button" onClick={goToScanner}>
                  Escanear QR
                </button>
              )}

              {currentFound === currentRequired && !isExperienceComplete && (
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
              <div
                id={`qr-reader-${scannerSession}`}
                key={`qr-reader-${scannerSession}`}
                style={{
                  width: "100%",
                  minHeight: "310px",
                  borderRadius: "22px",
                  overflow: "hidden",
                  background: "#eaf4ff"
                }}
              />
              <div className="scan-message">{scanMessage}</div>
            </div>

            <div className="manual-card">
              <span>Respaldo técnico</span>
              <div className="manual-row">
                <input
                  value={manualCode}
                  onChange={(event) => setManualCode(event.target.value.toUpperCase())}
                  placeholder="Ej: M1"
                />
                <button onClick={submitManualCode}>OK</button>
              </div>
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
              <p>{totalFound}/{totalRequired} ecos encontrados.</p>
            </div>

            <div className="achievement-grid">
              {zones.map((zone) => (
                <div className="achievement-card" key={zone.id}>
                  <img src={zone.icon} alt="" />
                  <strong>{zone.label}</strong>
                  <span>{progress.foundCodes[zone.id].length}/{zone.codes.length}</span>
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

          <button className={`nav-item ${screen === "map" || screen === "orientation" ? "active" : ""}`} onClick={goToMap}>
            <NavIcon type="mapa" />
            <span>Mapa</span>
          </button>

          <button className="scan-nav" onClick={goToScanner}>
            <NavIcon type="eco" />
          </button>

          <button
            className={`nav-item ${screen === "achievements" ? "active" : ""}`}
            onClick={() => {
              clearTransitionTimeout();
              unlockAudio();
              setScreen("achievements");
            }}
          >
            <NavIcon type="logros" />
            <span>Logros</span>
          </button>

          <button
            className={`nav-item ${screen === "menu" ? "active" : ""}`}
            onClick={() => {
              clearTransitionTimeout();
              unlockAudio();
              setScreen("menu");
            }}
          >
            <NavIcon type="menu" />
            <span>Menú</span>
          </button>
        </nav>
      </section>
    </main>
  );
}
