const fs = require("fs");

const filePath = "src/App.tsx";
const backupPath = "src/App.backup-audio-seguro.tsx";

let app = fs.readFileSync(filePath, "utf8");
fs.writeFileSync(backupPath, app, "utf8");

function stop(message) {
  console.error("\nERROR: " + message);
  console.error("No se aplicaron todos los cambios.");
  console.error("Backup creado en: " + backupPath);
  process.exit(1);
}

function replaceExact(oldText, newText, label) {
  if (!app.includes(oldText)) {
    stop("No encontre: " + label);
  }
  app = app.replace(oldText, newText);
}

function insertBeforeExact(target, insertText, label) {
  if (!app.includes(target)) {
    stop("No encontre donde insertar: " + label);
  }
  app = app.replace(target, insertText + "\n\n" + target);
}

/*
  1) Agregamos una función simple para reproducir cualquier MP3 de public/sounds.
  No reemplaza playVictorySound. Lo dejamos como estaba.
*/
if (!app.includes("function playAppAudio(")) {
  insertBeforeExact(
`function playVictorySound() {`,
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
}`,
    "playAppAudio"
  );
}

/*
  2) Audio al presionar Comenzar.
  Tu botón Comenzar usa goToIntro, entonces el audio tiene que ir ahí.
*/
replaceExact(
`const goToIntro = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("intro");
  };`,
`const goToIntro = () => {
    clearTransitionTimeout();
    unlockAudio();
    playAppAudio("comenzar.mp3");
    setScreen("intro");
  };`,
  "goToIntro"
);

/*
  3) Audio al presionar Ver mapa.
  Tu botón Ver mapa usa goToMap.
*/
replaceExact(
`const goToMap = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("map");
  };`,
`const goToMap = () => {
    clearTransitionTimeout();
    unlockAudio();
    playAppAudio("comenzar.mp3");
    setScreen("map");
  };`,
  "goToMap"
);

/*
  4) Audio al presionar Iniciar misión.
*/
replaceExact(
`const goToMission = () => {
    clearTransitionTimeout();
    unlockAudio();
    setPendingCode("");
    setQuestionFeedback("");
    setQuestionLocked(false);
    setScreen("mission");
  };`,
`const goToMission = () => {
    clearTransitionTimeout();
    unlockAudio();
    playAppAudio("iniciar-mision.mp3");
    setPendingCode("");
    setQuestionFeedback("");
    setQuestionLocked(false);
    setScreen("mission");
  };`,
  "goToMission"
);

/*
  5) Audio cuando responde bien un QR.
  Por ahora usamos iniciar-mision para el primer QR de cada zona
  y victoria para el segundo QR de cada zona.
*/
replaceExact(
`    if (completedAllZones) {
      // El sonido final se reproduce solo al abrir el álbum con victoria.mp3.
    } else if (zoneCompleted) {
      playSound("zone");
    } else {
      playSound("found");
    }`,
`    if (completedAllZones) {
      // El sonido final se reproduce solo al abrir el álbum con victoria.mp3.
    } else if (zoneCompleted) {
      playAppAudio("victoria.mp3");
    } else {
      playAppAudio("iniciar-mision.mp3");
    }`,
  "audio QR correcto"
);

fs.writeFileSync(filePath, app, "utf8");

console.log("");
console.log("OK: audios agregados sin tocar textos.");
console.log("Backup creado en: " + backupPath);
console.log("");
