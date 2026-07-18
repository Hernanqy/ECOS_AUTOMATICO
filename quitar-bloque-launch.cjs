const fs = require("fs");

const filePath = "src/App.tsx";
const backupPath = "src/App.backup-quitar-bloque-launch.tsx";

let app = fs.readFileSync(filePath, "utf8");
fs.writeFileSync(backupPath, app, "utf8");

/*
  Elimina cualquier bloque:
  if (type === "launch") { ... }
*/

app = app.replace(
/\s*if\s*\(\s*type\s*===\s*"launch"\s*\)\s*\{\s*playTone\(440[\s\S]*?playTone\(880[\s\S]*?\);\s*\}\s*/g,
"\n"
);

/*
  También elimina comparaciones viejas con launch si quedaron.
*/
app = app.replace(
  'if (!audioUnlockedRef.current && type !== "launch") return;',
  'if (!audioUnlockedRef.current) return;'
);

app = app.replaceAll('playSound("launch");', '');
app = app.replaceAll("playSound('launch');", "");

fs.writeFileSync(filePath, app, "utf8");

console.log("");
console.log("OK: bloque launch eliminado.");
console.log("Backup creado en: " + backupPath);
console.log("");
