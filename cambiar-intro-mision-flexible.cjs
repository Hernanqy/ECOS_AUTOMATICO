const fs = require("fs");

const filePath = "src/App.tsx";
const backupPath = "backups-app/App.backup-intro-mision-flexible.tsx";

let app = fs.readFileSync(filePath, "utf8");
fs.writeFileSync(backupPath, app, "utf8");

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

const regex = /            <div className="intro-steps-card intro-steps-featured mission-steps-only">[\s\S]*?            <\/div>\r?\n\r?\n            <button className="start-button compact mission-map-button"/;

if (!regex.test(app)) {
  console.error("");
  console.error("ERROR: no pude encontrar el bloque de los 3 pasos.");
  console.error("No se modificó App.tsx.");
  console.error("Backup creado en: " + backupPath);
  process.exit(1);
}

app = app.replace(regex, newBlock + `

            <button className="start-button compact mission-map-button"`);

fs.writeFileSync(filePath, app, "utf8");

console.log("");
console.log("OK: texto de la pantalla Tu misión actualizado.");
console.log("Backup creado en: " + backupPath);
console.log("");
