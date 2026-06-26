import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type Screen =
  | "home"
  | "intro"
  | "map"
  | "mission"
  | "scanner"
  | "question"
  | "reward"
  | "orientation"
  | "achievements"
  | "menu";

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

type QuestionOption = {
  id: string;
  text: string;
};

type EcoQuestion = {
  code: string;
  title: string;
  question: string;
  options: QuestionOption[];
  correctOptionId: string;
  successText: string;
  errorText: string;
};

type Reward = {
  title: string;
  subtitle: string;
  phrase: string;
  image: string;
};

const STORAGE_KEY = "ecos_progress_v6";

const zones: Zone[] = [
  {
    id: "museo",
    label: "Museo",
    title: "Ecos del pasado",
    mission: "Buscá 2 ecos en las salas.",
    success: "¡Museo completo! Ganaste una estampa.",
    icon: "/icons/museo.png",
    codes: ["M1", "M2"]
  },
  {
    id: "lago",
    label: "Lago",
    title: "Ecos del agua",
    mission: "Buscá 2 ecos cerca del agua.",
    success: "¡Lago completo! Ganaste una estampa.",
    icon: "/icons/lago.png",
    codes: ["L1", "L2"]
  },
  {
    id: "condorera",
    label: "Condorera",
    title: "Ecos del aire",
    mission: "Buscá 2 ecos mirando alto.",
    success: "¡Condorera completa! Ganaste una estampa.",
    icon: "/icons/condorera.png",
    codes: ["CO1", "CO2"]
  },
  {
    id: "casona",
    label: "Casona",
    title: "Ecos de la casa",
    mission: "Buscá los últimos 2 ecos.",
    success: "¡Casona completa! Ganaste la última estampa.",
    icon: "/icons/casona.png",
    codes: ["CA1", "CA2"]
  }
];

const rewards: Record<ZoneId, Reward> = {
  museo: {
    title: "La Científica",
    subtitle: "Premio del Museo",
    phrase: "El conocimiento ilumina cada descubrimiento.",
    image: "/rewards/estampa-cientifica.png"
  },
  lago: {
    title: "El Carpincho",
    subtitle: "Premio del Lago",
    phrase: "Cuidar el agua es cuidar la vida.",
    image: "/rewards/estampa-carpincho.png"
  },
  condorera: {
    title: "El Ancestro",
    subtitle: "Premio de La Condorera",
    phrase: "La memoria del territorio también vuela alto.",
    image: "/rewards/estampa-ancestro.png"
  },
  casona: {
    title: "El Guía",
    subtitle: "Premio de La Casona",
    phrase: "Cada historia compartida abre una nueva puerta.",
    image: "/rewards/estampa-guia.png"
  }
};

const questions: Record<string, EcoQuestion> = {
  M1: {
    code: "M1",
    title: "Eco de la megafauna",
    question: "Buscá el nombre del animal parecido al hipopótamo.",
    options: [
      { id: "A", text: "Gliptodonte" },
      { id: "B", text: "Macrauquenia" },
      { id: "C", text: "Toxodón" }
    ],
    correctOptionId: "C",
    successText: "¡Correcto! El Toxodón fue un gran mamífero prehistórico parecido al hipopótamo.",
    errorText: "Casi. Buscá bien el nombre del animal parecido al hipopótamo."
  },
  M2: {
    code: "M2",
    title: "Eco del Sistema Solar",
    question: "¿Cuándo se formó y evolucionó el Sistema Solar?",
    options: [
      { id: "A", text: "Hace 20.000 años" },
      { id: "B", text: "Hace 4.600 millones de años" },
      { id: "C", text: "Hace 3.500 millones de años" }
    ],
    correctOptionId: "B",
    successText: "¡Muy bien! El Sistema Solar se formó hace aproximadamente 4.600 millones de años.",
    errorText: "Probá otra vez. Pensá en una escala de tiempo mucho más antigua."
  },
  L1: {
    code: "L1",
    title: "Eco del carpincho",
    question: "Vivo cerca del agua, nado sin ser pez, soy tranquilo y bigotón. ¿Quién soy?",
    options: [
      { id: "A", text: "Tortuga" },
      { id: "B", text: "Lechuza" },
      { id: "C", text: "Carpincho" }
    ],
    correctOptionId: "C",
    successText: "¡Correcto! El carpincho vive cerca del agua y es parte de estos ambientes.",
    errorText: "Casi. Pensá en un animal tranquilo, bigotón y muy cercano a las lagunas."
  },
  L2: {
    code: "L2",
    title: "Eco del lago",
    question: "¿Cómo se llama el lago que ves?",
    options: [
      { id: "A", text: "El Resplandor" },
      { id: "B", text: "Jacques Cousteau" },
      { id: "C", text: "Pampa" }
    ],
    correctOptionId: "B",
    successText: "¡Excelente! El lago se llama Jacques Cousteau.",
    errorText: "Probá otra vez. Mirá bien el nombre del lago."
  },
  CO1: {
    code: "CO1",
    title: "Eco del cóndor",
    question: "¿Cuánto puede vivir un cóndor?",
    options: [
      { id: "A", text: "70 años" },
      { id: "B", text: "40 años" },
      { id: "C", text: "20 años" }
    ],
    correctOptionId: "A",
    successText: "¡Correcto! Un cóndor puede vivir alrededor de 70 años.",
    errorText: "Casi. Pensá en un ave muy longeva."
  },
  CO2: {
    code: "CO2",
    title: "Eco del ñandú",
    question: "No me busques en el agua, ni arriba de una rama. Mirá bien a tu alrededor: tengo patas largas, corro veloz, pero aunque tengo alas… no vuelo. ¿Quién soy?",
    options: [
      { id: "A", text: "Ñandú" },
      { id: "B", text: "Carpincho" },
      { id: "C", text: "Lechuza" }
    ],
    correctOptionId: "A",
    successText: "¡Muy bien! El ñandú corre veloz, tiene alas, pero no vuela.",
    errorText: "Probá otra vez. Pensá en un ave grande de patas largas que corre rápido."
  },
  CA1: {
    code: "CA1",
    title: "Eco de la yarará",
    question: "En mi cuerpo llevo dibujos que parecen una cruz al mirar. ¿Quién soy?",
    options: [
      { id: "A", text: "Yarará grande" },
      { id: "B", text: "Tortuga" },
      { id: "C", text: "Lagarto" }
    ],
    correctOptionId: "A",
    successText: "¡Correcto! La yarará grande tiene dibujos característicos que pueden parecer cruces.",
    errorText: "Casi. Observá cuál animal tiene dibujos con forma de cruz."
  },
  CA2: {
    code: "CA2",
    title: "Eco de la Casona",
    question: "Tengo paredes antiguas y memoria de estancia. Buscá en mi historia el año inicial: ¿desde cuándo esta casona nos mira pasar?",
    options: [
      { id: "A", text: "1877" },
      { id: "B", text: "1979" },
      { id: "C", text: "2024" }
    ],
    correctOptionId: "A",
    successText: "¡Excelente! La Casona conserva memoria desde 1877.",
    errorText: "Probá otra vez. Buscá el año inicial en la historia de la Casona."
  }
};

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

function getZoneByCode(code: string) {
  return zones.find((zone) => zone.codes.includes(code));
}

function getZoneIndexByCode(code: string) {
  return zones.findIndex((zone) => zone.codes.includes(code));
}

function isZoneComplete(progress: GameProgress, zone: Zone) {
  return zone.codes.every((code) => progress.foundCodes[zone.id].includes(code));
}

function isExperienceFinished(progress: GameProgress) {
  return zones.every((zone) => isZoneComplete(progress, zone));
}

function getFirstIncompleteZoneIndex(progress: GameProgress) {
  const firstIncompleteIndex = zones.findIndex((zone) => !isZoneComplete(progress, zone));
  return firstIncompleteIndex === -1 ? zones.length - 1 : firstIncompleteIndex;
}

function normalizeProgress(progress: GameProgress): GameProgress {
  const cleanedFoundCodes: Record<ZoneId, string[]> = {
    museo: [],
    lago: [],
    condorera: [],
    casona: []
  };

  zones.forEach((zone) => {
    const savedCodes = progress.foundCodes[zone.id] ?? [];
    cleanedFoundCodes[zone.id] = savedCodes.filter((code, index) => {
      return zone.codes.includes(code) && savedCodes.indexOf(code) === index;
    });
  });

  const cleanedProgress: GameProgress = {
    currentZoneIndex: 0,
    foundCodes: cleanedFoundCodes
  };

  cleanedProgress.currentZoneIndex = getFirstIncompleteZoneIndex(cleanedProgress);

  return cleanedProgress;
}

function loadProgress(): GameProgress {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialProgress;

  try {
    const parsed = JSON.parse(saved) as GameProgress;
    if (!parsed.foundCodes) return initialProgress;

    return normalizeProgress({
      currentZoneIndex: parsed.currentZoneIndex ?? 0,
      foundCodes: {
        museo: parsed.foundCodes.museo ?? [],
        lago: parsed.foundCodes.lago ?? [],
        condorera: parsed.foundCodes.condorera ?? [],
        casona: parsed.foundCodes.casona ?? []
      }
    });
  } catch {
    return initialProgress;
  }
}

function saveProgress(progress: GameProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProgress(progress)));
}

function resetStoredProgress() {
  localStorage.removeItem("ecos_progress");
  localStorage.removeItem("ecos_progress_v1");
  localStorage.removeItem("ecos_progress_v2");
  localStorage.removeItem("ecos_progress_v3");
  localStorage.removeItem("ecos_progress_v4");
  localStorage.removeItem("ecos_progress_v5");
  localStorage.removeItem("ecos_progress_v6");
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
      if (compactEco === code || compactEco.includes(code)) return code;
    }
  } catch {
    // No era URL.
  }

  for (const code of orderedCodes) {
    if (compactText.includes(code)) return code;
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

function shouldResetFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("reset") === "1";
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



function playVictorySound() {
  try {
    const audio = new Audio("/sounds/victoria.mp3?v=" + Date.now());
    audio.volume = 0.85;

    const playPromise = audio.play();

    if (playPromise) {
      playPromise.catch((error) => {
        console.warn("No se pudo reproducir victoria.mp3", error);
      });
    }
  } catch (error) {
    console.warn("No se pudo preparar victoria.mp3", error);
  }
}


function Header() {
  return (
    <header className="top-brand minimal-brand">
      <img
        src="/logo-maxima-verde.png"
        alt="La Máxima"
        className="maxima-symbol"
      />
    </header>
  );
}

function InstitutionalFooter() {
  return (
    <footer className="institutional-footer">
      <img
        src="/logo-municipio-color.png"
        alt="Municipio de Olavarría"
        className="municipio-logo"
      />
    </footer>
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
  const [rewardZoneId, setRewardZoneId] = useState<ZoneId | null>(null);
  const [pendingCode, setPendingCode] = useState("");
  const [questionFeedback, setQuestionFeedback] = useState("");
  const [questionLocked, setQuestionLocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(() => {
    try {
      return localStorage.getItem("ecos-experience-rating-submitted") === "true";
    } catch {
      return false;
    }
  });
  const [isNavVisible, setIsNavVisible] = useState(false);

  const scannerRef = useRef<any>(null);
  const scannerRunningRef = useRef(false);
  const qrReadRef = useRef(false);
  const hasProcessedUrlRef = useRef(false);
  const transitionTimeoutRef = useRef<number | null>(null);
  const celebrationTimeoutRef = useRef<number | null>(null);
  const lastCelebratedMomentRef = useRef("");
  const hasPlayedVictorySoundRef = useRef(false);
  const bottomNavTimeoutRef = useRef<number | null>(null);
  const screenTopRef = useRef<HTMLDivElement | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef(false);
  const launchSoundPlayedRef = useRef(false);

  const safeProgress = normalizeProgress(progress);
  const currentZone = zones[safeProgress.currentZoneIndex];
  const currentFound = safeProgress.foundCodes[currentZone.id].length;
  const currentRequired = currentZone.codes.length;
  const totalFound = Object.values(safeProgress.foundCodes).reduce((sum, list) => sum + list.length, 0);
  const totalRequired = zones.reduce((sum, zone) => sum + zone.codes.length, 0);
  const currentQuestion = pendingCode ? questions[pendingCode] : null;
  const currentReward = rewardZoneId ? rewards[rewardZoneId] : null;

  const isExperienceComplete = useMemo(() => {
    return isExperienceFinished(safeProgress);
  }, [safeProgress]);

  const orientationZoneIndex = completedZoneForMap ?? Math.max(safeProgress.currentZoneIndex - 1, 0);
  const orientationImage = getOrientationImage(orientationZoneIndex);
  const completedLabel = zones[orientationZoneIndex]?.label ?? "Recorrido";
  const nextLabel = zones[orientationZoneIndex + 1]?.label ?? "Final";

  function clearTransitionTimeout() {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }

  function safeSetProgress(nextProgress: GameProgress) {
    setProgress(normalizeProgress(nextProgress));
  }
  function celebrateFinalMoment() {
    setShowConfetti(true);

    if (celebrationTimeoutRef.current !== null) {
      window.clearTimeout(celebrationTimeoutRef.current);
    }

    celebrationTimeoutRef.current = window.setTimeout(() => {
      setShowConfetti(false);
      celebrationTimeoutRef.current = null;
    }, 2900);
  }

  function submitExperienceRating(value: number, label = "") {
    try {
      const stored = localStorage.getItem("ecos-experience-ratings");
      const ratings = stored ? JSON.parse(stored) : [];

      const entry = {
        id: Date.now(),
        rating: value,
        ratingLabel: label,
        createdAt: new Date().toISOString(),
        screen,
        progress
      };

      ratings.push(entry);

      localStorage.setItem("ecos-experience-ratings", JSON.stringify(ratings, null, 2));
      localStorage.setItem("ecos-experience-rating-submitted", "true");
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error("No se pudo guardar la calificación", error);
    }
  }

  function showBottomNav(delay = 1000) {
    setIsNavVisible(true);

    if (bottomNavTimeoutRef.current !== null) {
      window.clearTimeout(bottomNavTimeoutRef.current);
    }

    bottomNavTimeoutRef.current = window.setTimeout(() => {
      setIsNavVisible(false);
      bottomNavTimeoutRef.current = null;
    }, delay);
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

  function returnToCurrentMission(message: string, delay = 1800) {
    setScanMessage(message);

    transitionTimeoutRef.current = window.setTimeout(() => {
      transitionTimeoutRef.current = null;
      qrReadRef.current = false;
      setScreen("mission");
    }, delay);
  }

  function validateScannedCode(scannedCode: string) {
    const activeProgress = normalizeProgress(progress);
    const scannedZone = getZoneByCode(scannedCode);
    const scannedZoneIndex = getZoneIndexByCode(scannedCode);
    const activeZoneIndex = activeProgress.currentZoneIndex;
    const activeZone = zones[activeZoneIndex];

    if (!scannedZone || scannedZoneIndex === -1) {
      return {
        ok: false,
        message: "Este QR no pertenece a la experiencia."
      };
    }

    const codeAlreadyFound = activeProgress.foundCodes[scannedZone.id].includes(scannedCode);

    if (codeAlreadyFound) {
      if (scannedZoneIndex < activeZoneIndex) {
        return {
          ok: false,
          message: `Ese eco ya fue encontrado. Ahora seguí con ${activeZone.label}.`
        };
      }

      return {
        ok: false,
        message: "Este eco ya fue encontrado."
      };
    }

    if (scannedZoneIndex < activeZoneIndex) {
      return {
        ok: false,
        message: `Esa zona ya fue completada. Ahora seguí con ${activeZone.label}.`
      };
    }

    if (scannedZoneIndex > activeZoneIndex) {
      return {
        ok: false,
        message: `Todavía no llegaste a ${scannedZone.label}. Primero completá ${activeZone.label}.`
      };
    }

    return {
      ok: true,
      message: ""
    };
  }

  const handleScan = (value: string) => {
    clearTransitionTimeout();

    const scannedCode = getCodeFromQR(value);
    const validation = validateScannedCode(scannedCode);

    if (!validation.ok) {
      playSound("duplicate");
      setScreen("scanner");
      returnToCurrentMission(validation.message, 2200);
      return;
    }

    if (!questions[scannedCode]) {
      playSound("duplicate");
      setScreen("scanner");
      returnToCurrentMission("Este eco todavía no tiene pregunta cargada.", 2200);
      return;
    }

    setPendingCode(scannedCode);
    setQuestionFeedback("");
    setQuestionLocked(false);
    setScreen("question");
  };

  function completeEcoAfterCorrectAnswer(code: string) {
    const activeProgress = normalizeProgress(progress);
    const scannedZone = getZoneByCode(code);
    const scannedZoneIndex = getZoneIndexByCode(code);

    if (!scannedZone || scannedZoneIndex === -1) {
      playSound("duplicate");
      setQuestionFeedback("Este QR no pertenece a la experiencia.");
      setQuestionLocked(false);
      return;
    }

    const validation = validateScannedCode(code);

    if (!validation.ok) {
      playSound("duplicate");
      setQuestionFeedback(validation.message);
      setQuestionLocked(false);
      return;
    }

    const newFoundCodes = {
      ...activeProgress.foundCodes,
      [scannedZone.id]: [...activeProgress.foundCodes[scannedZone.id], code]
    };

    const zoneCompleted = newFoundCodes[scannedZone.id].length === scannedZone.codes.length;

    const temporaryProgress: GameProgress = {
      currentZoneIndex: activeProgress.currentZoneIndex,
      foundCodes: newFoundCodes
    };

    const completedAllZones = isExperienceFinished(temporaryProgress);

    const nextProgress: GameProgress = normalizeProgress({
      currentZoneIndex: zoneCompleted
        ? Math.min(activeProgress.currentZoneIndex + 1, zones.length - 1)
        : activeProgress.currentZoneIndex,
      foundCodes: newFoundCodes
    });

    if (completedAllZones) {
      // El sonido final se reproduce solo al abrir el álbum con victoria.mp3.
    } else if (zoneCompleted) {
      playSound("zone");
    } else {
      playSound("found");
    }

    safeSetProgress(nextProgress);

    const question = questions[code];

    if (completedAllZones) {
      setQuestionFeedback("¡Correcto! Completaste todos los ecos.");
    } else if (zoneCompleted) {
      setQuestionFeedback(scannedZone.success);
    } else {
      setQuestionFeedback(question.successText);
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      transitionTimeoutRef.current = null;
      setPendingCode("");
      setQuestionLocked(false);

      if (zoneCompleted) {
        setRewardZoneId(scannedZone.id);
        setCompletedZoneForMap(completedAllZones ? 3 : scannedZoneIndex);
        setScreen("reward");
        return;
      }

      setScreen("mission");
    }, zoneCompleted ? 2200 : 1600);
  }

  function answerQuestion(optionId: string) {
    if (!currentQuestion || questionLocked) return;

    if (optionId !== currentQuestion.correctOptionId) {
      playSound("duplicate");
      setQuestionFeedback(currentQuestion.errorText);
      return;
    }

    setQuestionLocked(true);
    completeEcoAfterCorrectAnswer(currentQuestion.code);
  }

  function continueFromReward() {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("orientation");
  }
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const phoneScreen = document.querySelector(".phone-screen");

      if (phoneScreen instanceof HTMLElement) {
        phoneScreen.scrollTop = 0;
      }

      screenTopRef.current?.scrollIntoView({
        block: "start",
        inline: "nearest",
        behavior: "auto"
      });
    };

    scrollToTop();

    const frame = window.requestAnimationFrame(scrollToTop);
    const timeout = window.setTimeout(scrollToTop, 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [screen, pendingCode, rewardZoneId, completedZoneForMap]);

  useEffect(() => {
    const handleBottomNavActivity = () => {
      showBottomNav(1000);
    };

    window.addEventListener("scroll", handleBottomNavActivity, { passive: true });
    window.addEventListener("wheel", handleBottomNavActivity, { passive: true });
    window.addEventListener("touchmove", handleBottomNavActivity, { passive: true });
    window.addEventListener("keydown", handleBottomNavActivity);

    return () => {
      window.removeEventListener("scroll", handleBottomNavActivity);
      window.removeEventListener("wheel", handleBottomNavActivity);
      window.removeEventListener("touchmove", handleBottomNavActivity);
      window.removeEventListener("keydown", handleBottomNavActivity);

      if (bottomNavTimeoutRef.current !== null) {
        window.clearTimeout(bottomNavTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    showBottomNav(1200);
  }, [screen]);

  useEffect(() => {
    const finalScreenKey =
      isExperienceComplete && (screen === "achievements" || screen === "map")
        ? screen
        : "";

    if (finalScreenKey && lastCelebratedMomentRef.current !== finalScreenKey) {
      lastCelebratedMomentRef.current = finalScreenKey;

      if (finalScreenKey === "achievements" && !hasPlayedVictorySoundRef.current) {
        hasPlayedVictorySoundRef.current = true;
        playVictorySound();
      }

      celebrateFinalMoment();
    }

    if (!isExperienceComplete) {
      lastCelebratedMomentRef.current = "";
      hasPlayedVictorySoundRef.current = false;
    }
  }, [screen, isExperienceComplete]);



  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current !== null) {
        window.clearTimeout(celebrationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isExperienceComplete || screen !== "reward") {
      return;
    }

    const autoOpenFinalAlbum = window.setTimeout(() => {
      clearTransitionTimeout();
      unlockAudio();
      setScreen("achievements");
    }, 1250);

    return () => {
      window.clearTimeout(autoOpenFinalAlbum);
    };
  }, [isExperienceComplete, screen]);

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

    if (shouldResetFromUrl()) {
      resetStoredProgress();
      setCompletedZoneForMap(null);
      setRewardZoneId(null);
      safeSetProgress(initialProgress);
      hasProcessedUrlRef.current = true;
      clearUrlParams();
      return;
    }

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
  }, [screen, safeProgress.currentZoneIndex, scannerSession]);

  const goToHome = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("home");
  };
  const goToIntro = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("intro");
  };


  const goToMap = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("map");
  };

  const goToMission = () => {
    clearTransitionTimeout();
    unlockAudio();
    setPendingCode("");
    setQuestionFeedback("");
    setQuestionLocked(false);
    setScreen("mission");
  };

  const goToScanner = async () => {
    clearTransitionTimeout();
    await unlockAudio();
    await stopScanner();
    qrReadRef.current = false;
    scannerRunningRef.current = false;
    scannerRef.current = null;
    setPendingCode("");
    setQuestionFeedback("");
    setQuestionLocked(false);
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
    resetStoredProgress();
    localStorage.removeItem("ecos-experience-rating-submitted");
    setFeedbackSubmitted(false);
    setCompletedZoneForMap(null);
    setRewardZoneId(null);
    setPendingCode("");
    setQuestionFeedback("");
    setQuestionLocked(false);
    safeSetProgress(initialProgress);
    setScreen("home");
  };

  const simulateScan = () => {
    const missingCode = currentZone.codes.find((code) => !safeProgress.foundCodes[currentZone.id].includes(code));
    if (missingCode) handleScan(missingCode);
  };

  const submitManualCode = () => {
    if (!manualCode.trim()) return;
    handleScan(manualCode);
  };

  return (
    <main className="app-shell">
      <section className="phone-screen">
        <Header />
        <BackgroundLines />

        <div ref={screenTopRef} className="screen-scroll-anchor" aria-hidden="true" />

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
                  <strong>¡Hola!</strong><span>Soy el Profesor Echarpe,</span>
                   <span className="hero-speech-line">Comencemos la aventura!</span>
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

              <button className="start-button" onClick={goToIntro}><span>Comenzar</span>
                <svg viewBox="0 0 40 40" aria-hidden="true">
                  <path d="M8 20h22" />
                  <path d="m22 11 9 9-9 9" />
                </svg>
              </button>
            </section>
          </>
        )}
        {screen === "intro" && (
          <section className="page-section intro-mission-section mission-only-section">
            <div className="page-title intro-title-clean">
              <span>Antes de empezar</span>
              <h2>Tu misión</h2>
            </div>

            <div className="intro-steps-card intro-steps-featured mission-steps-only">
              <div>
                <strong>1</strong>
                <span>Explorá cada zona.</span>
              </div>
              <div>
                <strong>2</strong>
                <span>Encontrá y escaneá los QR.</span>
              </div>
              <div>
                <strong>3</strong>
                <span>Respondé y ganá estampas.</span>
              </div>
            </div>

            <button className="start-button compact mission-map-button" onClick={goToMap}>
              <span>Ver mapa</span>
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <path d="M8 20h22" />
                <path d="m22 11 9 9-9 9" />
              </svg>
            </button>
          </section>
        )}

        {screen === "map" && (
          <section className="page-section map-screen-section map-image-only-section">
            <div className="page-title map-clean-title">
              <span>Mapa de misión</span>
              <h2>Recorrido inicial</h2>
              <p>Observá el mapa y luego comenzá la primera zona.</p>
            </div>

            <div className="intro-map-card map-full-card">
              <img src="/mapa-inicio-museo.png" alt="Mapa de misión desde el Museo" />
            </div>

            <button className="start-button compact map-start-button" onClick={goToMission}>
              <span>{isExperienceComplete ? "Ver estado final" : "Iniciar misión"}</span>
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <path d="M8 20h22" />
                <path d="m22 11 9 9-9 9" />
              </svg>
            </button>
          </section>
        )}

        {screen === "question" && currentQuestion && (
          <section className="page-section">
            <div className="question-card">
              <span className="mission-kicker">Pregunta del eco</span>
              <h2>{currentQuestion.title}</h2>
              <p className="question-text">{currentQuestion.question}</p>

              <div className="question-options">
                {currentQuestion.options.map((option) => (
                  <button
                    className="question-option"
                    key={option.id}
                    disabled={questionLocked}
                    onClick={() => answerQuestion(option.id)}
                  >
                    <strong>{option.id}</strong>
                    <span>{option.text}</span>
                  </button>
                ))}
              </div>

              {questionFeedback && (
                <div className={`question-feedback ${questionLocked ? "success" : "error"}`}>
                  {questionFeedback}
                </div>
              )}

              <button className="secondary-button" onClick={goToMission}>
                Volver a misión
              </button>
            </div>
          </section>
        )}

        {screen === "reward" && currentReward && (
          <section className="page-section reward-section">
            <div className="page-title">
              <span>Estampa desbloqueada</span>
              <h2>{currentReward.title}</h2>
              <p>{currentReward.subtitle}</p>
            </div>

            <div className="reward-card">
              <img src={currentReward.image} alt={currentReward.title} />
            </div>

            <div className="reward-phrase">
              {currentReward.phrase}
            </div>

            <button className="start-button compact" onClick={continueFromReward}>
              <span>Continuar al mapa</span>
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
              <span>{isExperienceComplete ? "Ver álbum" : `Ir a ${nextLabel}`}</span>
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

              <span className="mission-kicker">Zona {safeProgress.currentZoneIndex + 1} de 4</span>
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
          <section className="page-section album-section">
            <div className="page-title">
              <span>Álbum de estampas</span>
              <h2>{isExperienceComplete ? "¡Álbum completo!" : "Tus logros"}</h2>
              <p>{totalFound}/{totalRequired} ecos encontrados.</p>
            </div>

            <div className="album-grid">
              {zones.map((zone) => {
                const unlocked = isZoneComplete(safeProgress, zone);
                const reward = rewards[zone.id];

                return (
                  <div className={`album-card ${unlocked ? "unlocked" : "locked"}`} key={zone.id}>
                    {unlocked ? (
                      <img src={reward.image} alt={reward.title} />
                    ) : (
                      <div className="album-placeholder">?</div>
                    )}
                    <strong>{unlocked ? reward.title : "Estampa oculta"}</strong>
                    <span>{zone.label}</span>
                  </div>
                );
              })}
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


        {showConfetti && <ConfettiBurst />}

        {isExperienceComplete && (screen === "achievements" || screen === "map") && (
          <section className="end-feedback-section" aria-label="Calificar experiencia">
            <div className="end-feedback-card">
              <span className="end-feedback-kicker">¡Misión completada!</span>
              <h2>¡Completaste tu álbum!</h2>
              <p>
                Gracias por jugar y descubrir los ecos de La Máxima. ¿Cómo fue tu experiencia?
              </p>

              {feedbackSubmitted ? (
                <div className="feedback-saved">
                  <strong>¡Gracias por tu calificación!</strong>
                  <button className="feedback-download-button" onClick={downloadExperienceRatings}>
                    Descargar respuestas de este dispositivo
                  </button>
                </div>
              ) : (
                <div className="rating-buttons rating-faces" role="group" aria-label="Calificación de la experiencia">
                  {[
                    { value: 1, label: "Regular", face: "😐" },
                    { value: 2, label: "Buena", face: "🙂" },
                    { value: 3, label: "Muy buena", face: "😄" }
                  ].map((option) => (
                    <button
                      key={option.value}
                      className="rating-button rating-face-button"
                      onClick={() => submitExperienceRating(option.value, option.label)}
                      aria-label={"Calificar como " + option.label}
                    >
                      <span className="rating-face">{option.face}</span>
                      <small>{option.label}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <InstitutionalFooter />

        <div
          className="ecos-nav-touch-zone"
          aria-hidden="true"
          onPointerDown={() => showBottomNav(1800)}
          onTouchStart={() => showBottomNav(1800)}
        />

        <nav
          className={`ecos-bottom-nav ${isNavVisible ? "is-visible" : "is-hidden"}`}
          aria-label="Navegación principal"
          onPointerDown={() => showBottomNav(2000)}
          onPointerMove={() => showBottomNav(1800)}
          onFocusCapture={() => showBottomNav(2000)}
        >
          <button className={`ecos-nav-item ${screen === "home" ? "is-active" : ""}`} onClick={goToHome}>
            <NavIcon type="inicio" />
            <span>Inicio</span>
          </button>

          <button className={`ecos-nav-item ${screen === "map" || screen === "orientation" ? "is-active" : ""}`} onClick={goToMap}>
            <NavIcon type="mapa" />
            <span>Mapa</span>
          </button>

          <button className="ecos-scan-button" onClick={goToScanner}>
            <NavIcon type="eco" />
          </button>

          <button
            className={`ecos-nav-item ${screen === "achievements" ? "is-active" : ""}`}
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
            className={`ecos-nav-item ${screen === "menu" ? "is-active" : ""}`}
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









