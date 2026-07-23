const fs = require("fs");

const filePath = "src/App.tsx";
let app = fs.readFileSync(filePath, "utf8");

function fail(message) {
  console.error("");
  console.error("ERROR: " + message);
  process.exit(1);
}

/*
  Agrega una referencia global para guardar el audio actual.
*/
if (!app.includes("let currentAppAudio: HTMLAudioElement | null = null;")) {
  const target = "function playAppAudio(filename: string)";

  if (!app.includes(target)) {
    fail("No encontre function playAppAudio.");
  }

  app = app.replace(
    target,
    "let currentAppAudio: HTMLAudioElement | null = null;\n\n" + target
  );
}

/*
  Reemplaza playAppAudio completa.
  Antes de reproducir un nuevo audio, pausa y reinicia el anterior.
*/
const regex = /function playAppAudio\(filename: string\) \{[\s\S]*?\n\}/;

if (!regex.test(app)) {
  fail("No pude reemplazar playAppAudio.");
}

const newFunction = `function playAppAudio(filename: string) {
  try {
    if (currentAppAudio) {
      currentAppAudio.pause();
      currentAppAudio.currentTime = 0;
      currentAppAudio = null;
    }

    const audio = new Audio("/sounds/" + filename + "?v=" + Date.now());
    audio.volume = 0.9;
    currentAppAudio = audio;

    audio.onended = () => {
      if (currentAppAudio === audio) {
        currentAppAudio = null;
      }
    };

    const playPromise = audio.play();

    if (playPromise) {
      playPromise.catch((error) => {
        console.warn("No se pudo reproducir " + filename, error);
      });
    }
  } catch (error) {
    console.warn("No se pudo preparar " + filename, error);
  }
}`;

app = app.replace(regex, newFunction);

fs.writeFileSync(filePath, app, "utf8");

console.log("");
console.log("OK: ahora solo puede sonar un audio por vez.");
console.log("Backup creado en backups-app/App.backup-audio-uno-por-vez.tsx");
console.log("");
