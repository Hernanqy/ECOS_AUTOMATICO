const fs = require("fs");

const filePath = "src/App.tsx";
const backupPath = "src/App.backup-audio-comenzar-iniciar.tsx";

let app = fs.readFileSync(filePath, "utf8");
fs.writeFileSync(backupPath, app, "utf8");

function fail(message) {
  console.error("");
  console.error("ERROR: " + message);
  console.error("Backup creado en: " + backupPath);
  process.exit(1);
}

function replaceRegex(regex, replacement, label) {
  if (!regex.test(app)) {
    fail("No encontre: " + label);
  }

  app = app.replace(regex, replacement);
}

/*
  1) Asegurar funcion para reproducir MP3 desde public/sounds.
*/
if (!app.includes("function playAppAudio(")) {
  const target = "function playVictorySound() {";

  if (!app.includes(target)) {
    fail("No encontre donde insertar playAppAudio");
  }

  app = app.replace(
    target,
`function playAppAudio(filename: string) {
  try {
    const audio = new Audio("/sounds/" + filename + "?v=" + Date.now());
    audio.volume = 0.9;

    const playPromise = audio.play();

    if (playPromise) {
      playPromise.catch((error) => {
        console.warn("No se pudo reproducir " + filename, error);
      });
    }
  } catch (error) {
    console.warn("No se pudo preparar " + filename, error);
  }
}

${target}`
  );
}

/*
  2) Apagar de raiz el bip viejo de launch.
*/
app = app.replaceAll('playSound("launch");', '// launch desactivado');
app = app.replaceAll("playSound('launch');", "// launch desactivado");

/*
  3) Blindaje extra: si alguien llama playSound("launch"), no suena.
*/
if (!app.includes('if (type === "launch") return;')) {
  replaceRegex(
    /function playSound\(type: SoundType\) \{\s*try \{/,
`function playSound(type: SoundType) {
    if (type === "launch") return;

    try {`,
    "funcion playSound"
  );
}

/*
  4) Boton Comenzar.
  En tu app Comenzar llama a goToIntro.
*/
replaceRegex(
  /const goToIntro = \(\) => \{[\s\S]*?\n  \};/,
`const goToIntro = () => {
    clearTransitionTimeout();
    playAppAudio("comenzar.mp3");
    setScreen("intro");
  };`,
  "goToIntro"
);

/*
  5) Boton Iniciar mision.
*/
replaceRegex(
  /const goToMission = \(\) => \{[\s\S]*?setPendingCode\(""\);[\s\S]*?setQuestionFeedback\(""\);[\s\S]*?setQuestionLocked\(false\);[\s\S]*?setScreen\("mission"\);[\s\S]*?\n  \};/,
`const goToMission = () => {
    clearTransitionTimeout();
    playAppAudio("iniciar-mision.mp3");
    setPendingCode("");
    setQuestionFeedback("");
    setQuestionLocked(false);
    setScreen("mission");
  };`,
  "goToMission"
);

fs.writeFileSync(filePath, app, "utf8");

console.log("");
console.log("OK: Comenzar ahora reproduce comenzar.mp3.");
console.log("OK: Iniciar mision ahora reproduce iniciar-mision.mp3.");
console.log("OK: bip viejo launch apagado.");
console.log("Backup creado en: " + backupPath);
console.log("");
