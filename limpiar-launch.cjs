const fs = require("fs");

const filePath = "src/App.tsx";
const backupPath = "src/App.backup-limpiar-launch.tsx";

let app = fs.readFileSync(filePath, "utf8");
fs.writeFileSync(backupPath, app, "utf8");

/*
  Limpia definitivamente el sonido viejo "launch"
  para que no marque error y no haga bip.
*/

// 1) Cambiar la validacion vieja
app = app.replace(
  'if (!audioUnlockedRef.current && type !== "launch") return;',
  'if (!audioUnlockedRef.current) return;'
);

// 2) Eliminar el bloque viejo que hacia el bip launch
app = app.replace(
`      if (type === "launch") {
        playTone(440, 0, 0.12, 0.07, "sine");
        playTone(660, 0.12, 0.14, 0.07, "sine");
        playTone(880, 0.26, 0.18, 0.06, "triangle");
      }

`,
  ''
);

// 3) Si quedo el blindaje que pusimos antes, lo dejamos.
// Pero si esta duplicado, no pasa nada.

fs.writeFileSync(filePath, app, "utf8");

console.log("");
console.log("OK: se limpio el launch viejo.");
console.log("Backup creado en: " + backupPath);
console.log("");
