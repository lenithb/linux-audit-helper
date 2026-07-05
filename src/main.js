import { parseIp } from "./parsers/parseIp.js";
import { parseDisk } from "./parsers/parseDisk.js";
import { parsePorts } from "./parsers/parsePorts.js";
import { parsePermissions } from "./parsers/parsePermissions.js";
import { parseUser } from "./parsers/parseUser.js";
import { parseGroups } from "./parsers/parseGroups.js";
import { loadInputs, saveInputs } from "./storage.js";

// por ahora cada comando se muestra suelto, todavia no hay dashboard resumen

const COMMANDS = [
  { id: "ip", title: "ip a", parser: parseIp },
  { id: "df", title: "df -h", parser: parseDisk },
  { id: "ss", title: "ss -tulpen", parser: parsePorts },
  { id: "ls", title: "ls -la", parser: parsePermissions },
  { id: "whoami", title: "whoami", parser: parseUser },
  { id: "groups", title: "groups", parser: parseGroups },
];

const inputs = loadInputs();

const app = document.getElementById("app");

const panelsHtml = COMMANDS.map(
  (cmd) => `
  <div class="panel">
    <h2>${cmd.title}</h2>
    <textarea id="input-${cmd.id}" placeholder="pegar salida de ${cmd.title}">${inputs[cmd.id] || ""}</textarea>
    <br />
    <button data-id="${cmd.id}">Parsear</button>
    <pre id="output-${cmd.id}">esperando datos...</pre>
  </div>
`,
).join("");

app.innerHTML = `
  <h1>Linux Audit Helper</h1>
  <p class="subtitle">Pega salidas de comandos linux y revisa lo que se puede extraer de cada una.</p>
  ${panelsHtml}
`;

// guardamos el texto pegado cada vez que cambia, para no perderlo al recargar
COMMANDS.forEach((cmd) => {
  const textarea = document.getElementById(`input-${cmd.id}`);
  textarea.addEventListener("input", () => {
    inputs[cmd.id] = textarea.value;
    saveInputs(inputs);
  });
});

document.querySelectorAll("button[data-id]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.id;
    const cmd = COMMANDS.find((c) => c.id === id);
    const text = document.getElementById(`input-${id}`).value;
    const result = cmd.parser(text);
    document.getElementById(`output-${id}`).textContent = JSON.stringify(
      result,
      null,
      2,
    );
  });
});
