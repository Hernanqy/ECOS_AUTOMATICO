const fs = require("fs");

const filePath = "src/App.tsx";
const backupPath = "src/App.backup-intro-mision.tsx";

let app = fs.readFileSync(filePath, "utf8");
fs.writeFileSync(backupPath, app, "utf8");

const oldBlock = `            <div className="intro-steps-card intro-steps-featured mission-steps-only">
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
            </div>`;

const newBlock = `            <div className="intro-steps-card intro-steps-featured mission-steps-only">
              <div>
                <strong>1</strong>
                <span>Empezá en el Museo y seguí: Lago, Condorera y Casona.</span>
              </div>
              <div>
                <strong>2</strong>
                <span>En cada área buscá 2 pistas y escaneá sus QR.</span>
              </div>
              <div>
                <strong>3</strong>
                <span>Observá, respondé las preguntas y ganá estampas.</span>
              </div>
            </div>`;

if (!app.includes(oldBlock)) {
  console.error("");
  console.error("ERROR: no encontré el bloque exacto de la pantalla Tu misión.");
  console.error("No se modificó App.tsx.");
  console.error("Backup creado en: " + backupPath);
  process.exit(1);
}

app = app.replace(oldBlock, newBlock);

fs.writeFileSync(filePath, app, "utf8");

console.log("");
console.log("OK: texto de la segunda pantalla actualizado.");
console.log("Backup creado en: " + backupPath);
console.log("");
