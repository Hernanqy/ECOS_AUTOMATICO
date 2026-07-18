const fs = require("fs");

const filePath = "src/App.tsx";
const backupPath = "src/App.backup-before-audio.tsx";

let app = fs.readFileSync(filePath, "utf8");

fs.writeFileSync(backupPath, app, "utf8");

function fail(message) {
  console.error("\nERROR: " + message);
  console.error("No se modifico App.tsx.");
  console.error("Se dejo una copia de seguridad en: " + backupPath);
  process.exit(1);
}

function replaceOnce(searchValue, replaceValue, label) {
  if (!app.includes(searchValue)) {
    fail("No encontre el bloque: " + label);
  }

  app = app.replace(searchValue, replaceValue);
}

function insertBefore(searchValue, insertValue, label) {
  if (!app.includes(searchValue)) {
    fail("No encontre donde insertar: " + label);
  }

  app = app.replace(searchValue, insertValue + "\n" + searchValue);
}

function insertAfter(searchValue, insertValue, label) {
  if (!app.includes(searchValue)) {
    fail("No encontre donde insertar: " + label);
  }

  app = app.replace(searchValue, searchValue + "\n" + insertValue);
}

if (!app.includes("const codeAudioMap")) {
  insertBefore(
`const validCodes = zones.flatMap((zone) => zone.codes);`,
`const codeAudioMap: Record<string, string> = {
  M1: "iniciar-mision.mp3",
  M2: "victoria.mp3",
  L1: "iniciar-mision.mp3",
  L2: "victoria.mp3",
  CO1: "iniciar-mision.mp3",
  CO2: "victoria.mp3",
  CA1: "iniciar-mision.mp3",
  CA2: "victoria.mp3"
};

`,
    "mapa de audios por QR"
  );
}

if (!app.includes("currentAudioRef")) {
  insertAfter(
`  const launchSoundPlayedRef = useRef(false);`,
`  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const finalAudioPlayedRef = useRef(false);`,
    "referencias de audio"
  );
}

if (!app.includes("async function playAudioFile")) {
  insertBefore(
`  async function stopScanner() {`,
`  async function playAudioFile(filename: string, fallback?: SoundType) {
    try {
      await unlockAudio();

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }

      const audio = new Audio(\`/sounds/\${filename}\`);
      audio.volume = 1;
      currentAudioRef.current = audio;

      await audio.play();
    } catch {
      if (fallback) {
        playSound(fallback);
      }
    }
  }

  function playCodeAudio(code: string) {
    const filename = codeAudioMap[code];

    if (!filename) {
      playSound("found");
      return;
    }

    playAudioFile(filename, "found");
  }

`,
    "funciones de audio mp3"
  );
}

if (!app.includes("function startExperience")) {
  insertBefore(
`  const goToHome = () => {`,
`  function startExperience() {
    clearTransitionTimeout();
    playAudioFile("comenzar.mp3", "launch");
    setScreen("map");
  }

`,
    "funcion comenzar con audio"
  );
}

app = app.replace(
  `onClick={goToMap}`,
  `onClick={startExperience}`
);

if (app.includes(`const goToMap = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("map");
  };`)) {
  replaceOnce(
`const goToMap = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("map");
  };`,
`const goToMap = () => {
    clearTransitionTimeout();
    playAudioFile("comenzar.mp3", "found");
    setScreen("map");
  };`,
    "goToMap con audio"
  );
}

if (app.includes(`const goToMission = () => {
    clearTransitionTimeout();
    unlockAudio();`)) {
  replaceOnce(
`const goToMission = () => {
    clearTransitionTimeout();
    unlockAudio();`,
`const goToMission = () => {
    clearTransitionTimeout();
    playAudioFile("iniciar-mision.mp3", "found");`,
    "goToMission con audio"
  );
}

if (!app.includes("playCodeAudio(code);")) {
  replaceOnce(
`    safeSetProgress(nextProgress);`,
`    playCodeAudio(code);
    safeSetProgress(nextProgress);`,
    "audio al responder QR correcto"
  );
}

if (!app.includes(`screen === "achievements" && isExperienceComplete && !finalAudioPlayedRef.current`)) {
  insertBefore(
`  useEffect(() => {
    let cancelled = false;`,
`  useEffect(() => {
    if (screen === "achievements" && isExperienceComplete && !finalAudioPlayedRef.current) {
      finalAudioPlayedRef.current = true;
      playAudioFile("victoria.mp3", "final");
    }
  }, [screen, isExperienceComplete]);

`,
    "audio final en album"
  );
}

if (app.includes(`if (isExperienceComplete) {
      setScreen("achievements");
      return;
    }

    setScreen("mission");`)) {
  replaceOnce(
`if (isExperienceComplete) {
      setScreen("achievements");
      return;
    }

    setScreen("mission");`,
`if (isExperienceComplete) {
      setScreen("achievements");
      return;
    }

    playAudioFile("iniciar-mision.mp3", "found");
    setScreen("mission");`,
    "audio al pasar del mapa a la siguiente mision"
  );
}

if (app.includes(`setRewardZoneId(null);
      safeSetProgress(initialProgress);`)) {
  app = app.replace(
`setRewardZoneId(null);
      safeSetProgress(initialProgress);`,
`setRewardZoneId(null);
      finalAudioPlayedRef.current = false;
      safeSetProgress(initialProgress);`
  );
}

if (app.includes(`setRewardZoneId(null);
    setPendingCode("");`)) {
  app = app.replace(
`setRewardZoneId(null);
    setPendingCode("");`,
`setRewardZoneId(null);
    finalAudioPlayedRef.current = false;
    setPendingCode("");`
  );
}

fs.writeFileSync(filePath, app, "utf8");

console.log("");
console.log("OK: App.tsx modificado sin tocar los textos.");
console.log("Backup creado en: " + backupPath);
console.log("");
