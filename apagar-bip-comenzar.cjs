const fs = require("fs");

const filePath = "src/App.tsx";
const backupPath = "src/App.backup-apagar-bip-launch.tsx";

let app = fs.readFileSync(filePath, "utf8");
fs.writeFileSync(backupPath, app, "utf8");

function fail(message) {
  console.error("");
  console.error("ERROR: " + message);
  console.error("Backup creado en: " + backupPath);
  process.exit(1);
}

function replaceBlock(regex, replacement, label) {
  if (!regex.test(app)) {
    fail("No encontre: " + label);
  }
  app = app.replace(regex, replacement);
}

/*
  1) Apagar cualquier bip viejo de launch, aunque haya quedado en otro lugar.
*/
app = app.replaceAll('playSound("launch");', '// launch desactivado');
app = app.replaceAll("playSound('launch');", "// launch desactivado");

/*
  2) Blindaje extra: si alguien llama playSound("launch"), no hace nada.
*/
replaceBlock(
/function playSound\(type: SoundType\) \{\s*try \{/,
`function playSound(type: SoundType) {
    if (type === "launch") return;

    try {`,
"funcion playSound"
);

/*
  3) Asegurar que exista playAppAudio para reproducir MP3 desde public/sounds.
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
  4) Comenzar debe ejecutar solamente iniciar-mision.mp3.
  Sacamos unlockAudio de goToIntro para que no active nada viejo.
*/
replaceBlock(
/const goToIntro = \(\) => \{\s*clearTransitionTimeout\(\);\s*(?:unlockAudio\(\);\s*)?(?:playAppAudio\("[^"]+"\);\s*)?setScreen\("intro"\);\s*\};/,
`const goToIntro = () => {
    clearTransitionTimeout();
    playAppAudio("iniciar-mision.mp3");
    setScreen("intro");
  };`,
"goToIntro"
);

/*
  5) Evitar que el listener global del primer click active unlockAudio y dispare algo viejo.
  Ya no necesitamos desbloquear sonido con bip: los MP3 se disparan desde botones reales.
*/
app = app.replace(
`  useEffect(() => {
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
  }, []);`,
`  useEffect(() => {
    // Audio global desactivado para evitar el bip viejo al primer toque.
  }, []);`
);

fs.writeFileSync(filePath, app, "utf8");

console.log("");
console.log("OK: bip viejo launch apagado de raiz.");
console.log("OK: Comenzar reproduce solo iniciar-mision.mp3.");
console.log("Backup creado en: " + backupPath);
console.log("");
