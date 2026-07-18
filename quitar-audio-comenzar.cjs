const fs = require("fs");

const filePath = "src/App.tsx";
const backupPath = "src/App.backup-quitar-audio-comenzar.tsx";

let app = fs.readFileSync(filePath, "utf8");
fs.writeFileSync(backupPath, app, "utf8");

/*
  Quita el audio agregado en Comenzar y Ver mapa.
  Deja solamente iniciar-mision.mp3 en goToMission.
*/

// 1) Quitar audio de Comenzar si quedó en goToIntro
app = app.replace(
`const goToIntro = () => {
    clearTransitionTimeout();
    unlockAudio();
    playAppAudio("comenzar.mp3");
    setScreen("intro");
  };`,
`const goToIntro = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("intro");
  };`
);

// 2) Quitar audio de Ver mapa si quedó en goToMap
app = app.replace(
`const goToMap = () => {
    clearTransitionTimeout();
    unlockAudio();
    playAppAudio("comenzar.mp3");
    setScreen("map");
  };`,
`const goToMap = () => {
    clearTransitionTimeout();
    unlockAudio();
    setScreen("map");
  };`
);

// 3) Quitar el sonido interno de lanzamiento que se dispara con el primer click
app = app.replace(
`      if (!launchSoundPlayedRef.current) {
        launchSoundPlayedRef.current = true;
        playSound("launch");
      }`,
`      if (!launchSoundPlayedRef.current) {
        launchSoundPlayedRef.current = true;
      }`
);

// 4) Asegurar que Iniciar misión sí tenga su audio
app = app.replace(
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
  };`
);

fs.writeFileSync(filePath, app, "utf8");

console.log("");
console.log("OK: se quito el audio de Comenzar y Ver mapa.");
console.log("Queda activo el audio de Iniciar mision.");
console.log("Backup creado en: " + backupPath);
console.log("");
