import './styles.css';
import { parseIp } from './parsers/parseIp.js';
import { parseDisk } from './parsers/parseDisk.js';
import { parsePorts } from './parsers/parsePorts.js';
import { parsePermissions } from './parsers/parsePermissions.js';
import { parseUser } from './parsers/parseUser.js';
import { parseGroups } from './parsers/parseGroups.js';
import { loadState, saveState, resetState } from './storage.js';
import { buildMarkdownReport } from './report.js';
import { showToast } from './ui.js';

let state = loadState();

// definimos cada comando soportado en un solo lugar para no repetir logica
const COMMANDS = [
  {
    id: 'ip',
    title: 'ip a',
    help: 'Pega la salida completa del comando "ip a". Se usa para detectar interfaces de red e IPs locales.',
    placeholder: '1: lo: <LOOPBACK,UP,LOWER_UP> ...\n2: enp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> ...\n    inet 192.168.1.10/24 ...',
    parser: parseIp
  },
  {
    id: 'df',
    title: 'df -h',
    help: 'Pega la salida de "df -h" para revisar el uso de disco de cada particion.',
    placeholder: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   30G   18G  63% /',
    parser: parseDisk
  },
  {
    id: 'ss',
    title: 'ss -tulpen',
    help: 'Pega la salida de "ss -tulpen" para listar los puertos en escucha.',
    placeholder: 'Netid State  Local Address:Port  Peer Address:Port\ntcp   LISTEN 0.0.0.0:22           0.0.0.0:*',
    parser: parsePorts
  },
  {
    id: 'ls',
    title: 'ls -la',
    help: 'Pega la salida de "ls -la" del directorio que quieras revisar, para detectar permisos riesgosos.',
    placeholder: 'total 24\ndrwxr-xr-x  4 user user 4096 jun 1 10:00 .\n-rw-rw-rw-  1 user user  220 jun 1 10:00 archivo.txt',
    parser: parsePermissions
  },
  {
    id: 'whoami',
    title: 'whoami',
    help: 'Pega la salida de "whoami" para identificar el usuario actual.',
    placeholder: 'usuario',
    parser: parseUser
  },
  {
    id: 'groups',
    title: 'groups',
    help: 'Pega la salida de "groups" para ver a que grupos pertenece el usuario.',
    placeholder: 'usuario : sudo docker adm',
    parser: parseGroups
  }
];

function persist() {
  saveState(state);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---- renderizado: encabezado ----

function renderHeader() {
  return `
    <header class="app-header">
      <div class="ledger-bar">
        <span class="ledger-dot"></span>
        <span>usuario@auditoria:~$ estado --local</span>
        <span class="ledger-cursor"></span>
      </div>
      <h1 class="app-title">Linux Audit Helper</h1>
      <p class="app-subtitle">
        Pega salidas de comandos de tu propia maquina Linux y obtene un panel claro
        con la informacion organizada, sin ejecutar nada y sin salir del navegador.
      </p>
      <div class="disclaimer-strip">
        <span>Esta herramienta no ejecuta comandos en tu maquina.</span>
        <span>Analiza unicamente sistemas que sean tuyos o que tengas permiso de auditar.</span>
      </div>
    </header>
  `;
}

// ---- renderizado: resumen del dashboard ----

function summaryCard(label, valueHtml, detailHtml = '') {
  return `
    <div class="summary-card">
      <div class="summary-label">${label}</div>
      ${valueHtml}
      ${detailHtml}
    </div>
  `;
}

function renderSummary() {
  const { parsed, checklist } = state;

  const user = parsed.whoami?.username
    ? `<div class="summary-value">${escapeHtml(parsed.whoami.username)}</div>`
    : `<div class="summary-value empty">Sin datos aun</div>`;

  const groupsCount = parsed.groups?.groups?.length || 0;
  const groupsValue = groupsCount
    ? `<div class="summary-value">${groupsCount}</div><div class="summary-detail">${escapeHtml(parsed.groups.groups.join(', '))}</div>`
    : `<div class="summary-value empty">Sin datos aun</div>`;

  const ifaceCount = parsed.ip?.interfaces?.length || 0;
  const ifaceValue = ifaceCount
    ? `<div class="summary-value">${ifaceCount}</div>`
    : `<div class="summary-value empty">Sin datos aun</div>`;

  const allIps = (parsed.ip?.interfaces || []).flatMap((i) => i.ipv4);
  const ipsValue = allIps.length
    ? `<div class="summary-value">${allIps.length}</div><div class="summary-detail">${escapeHtml(allIps.join(', '))}</div>`
    : `<div class="summary-value empty">Sin datos aun</div>`;

  const listeningPorts = (parsed.ss?.ports || []).filter((p) => p.listening);
  const portsValue = listeningPorts.length
    ? `<div class="summary-value">${listeningPorts.length}</div>`
    : `<div class="summary-value empty">Sin datos aun</div>`;

  const volumes = parsed.df?.volumes || [];
  const warningVolumes = volumes.filter((v) => v.warning);
  const diskValue = volumes.length
    ? `<div class="summary-value">${volumes.length} particiones</div>
       ${warningVolumes.length ? `<span class="status-badge warning"><span class="status-dot"></span>${warningVolumes.length} en alerta</span>` : `<span class="status-badge safe"><span class="status-dot"></span>ok</span>`}`
    : `<div class="summary-value empty">Sin datos aun</div>`;

  const permissionEntries = parsed.ls?.entries || [];
  const worldWritable = permissionEntries.filter((e) => e.worldWritable);
  const permsValue = permissionEntries.length
    ? `<div class="summary-value">${worldWritable.length}</div>
       ${worldWritable.length ? `<span class="status-badge warning"><span class="status-dot"></span>revisar</span>` : `<span class="status-badge safe"><span class="status-dot"></span>ok</span>`}`
    : `<div class="summary-value empty">Sin datos aun</div>`;

  const doneCount = checklist.filter((c) => c.done).length;
  const checklistValue = `<div class="summary-value">${doneCount}/${checklist.length}</div>`;

  const cards = [
    summaryCard('Usuario detectado', user),
    summaryCard('Grupos', groupsValue),
    summaryCard('Interfaces de red', ifaceValue),
    summaryCard('IPs locales', ipsValue),
    summaryCard('Puertos en escucha', portsValue),
    summaryCard('Uso de disco', diskValue),
    summaryCard('Permisos sospechosos', permsValue),
    summaryCard('Progreso del checklist', checklistValue)
  ].join('');

  return `
    <section class="section">
      <div class="section-heading">
        <h2>Resumen</h2>
        <p>Se actualiza automaticamente con lo que vayas parseando</p>
      </div>
      <div class="summary-grid">${cards}</div>
    </section>
  `;
}

// ---- renderizado: paneles de entrada ----

function renderPanels() {
  const cards = COMMANDS.map((cmd) => {
    const value = state.rawInputs[cmd.id] || '';
    return `
      <div class="panel-card">
        <div class="panel-title">${cmd.title}</div>
        <div class="panel-help">${cmd.help}</div>
        <textarea
          class="panel-textarea"
          data-input-id="${cmd.id}"
          placeholder="${escapeHtml(cmd.placeholder)}"
        >${escapeHtml(value)}</textarea>
        <div class="panel-actions">
          <button class="btn btn-primary" data-action="parse" data-id="${cmd.id}">Parsear</button>
          <button class="btn btn-ghost" data-action="clear" data-id="${cmd.id}">Limpiar</button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="section">
      <div class="section-heading">
        <h2>Entradas de comandos</h2>
        <p>Cada input queda guardado localmente en tu navegador</p>
      </div>
      <div class="panel-grid">${cards}</div>
    </section>
  `;
}

// ---- renderizado: resultados parseados ----

function renderResults() {
  const { parsed } = state;
  const blocks = [];

  // ip a
  blocks.push(`
    <div class="result-card">
      <h3>ip a</h3>
      ${
        parsed.ip?.interfaces?.length
          ? `<table class="data-table">
              <thead><tr><th>Interfaz</th><th>Estado</th><th>IPv4</th><th>IPv6</th></tr></thead>
              <tbody>
                ${parsed.ip.interfaces.map((i) => `
                  <tr>
                    <td>${escapeHtml(i.name)}</td>
                    <td>${escapeHtml(i.state)}</td>
                    <td>${escapeHtml(i.ipv4.join(', ') || '-')}</td>
                    <td>${escapeHtml(i.ipv6.join(', ') || '-')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          : `<div class="empty-state">No data parsed yet.</div>`
      }
    </div>
  `);

  // df -h
  blocks.push(`
    <div class="result-card">
      <h3>df -h</h3>
      ${
        parsed.df?.volumes?.length
          ? `<table class="data-table">
              <thead><tr><th>Filesystem</th><th>Size</th><th>Used</th><th>Avail</th><th>Use%</th><th>Mounted on</th></tr></thead>
              <tbody>
                ${parsed.df.volumes.map((v) => `
                  <tr class="${v.warning ? 'row-warning' : ''}">
                    <td>${escapeHtml(v.filesystem)}</td>
                    <td>${escapeHtml(v.size)}</td>
                    <td>${escapeHtml(v.used)}</td>
                    <td>${escapeHtml(v.available)}</td>
                    <td>${escapeHtml(v.usePercent)}</td>
                    <td>${escapeHtml(v.mountedOn)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          : `<div class="empty-state">No data parsed yet.</div>`
      }
    </div>
  `);

  // ss -tulpen
  blocks.push(`
    <div class="result-card">
      <h3>ss -tulpen</h3>
      ${
        parsed.ss?.ports?.length
          ? `<table class="data-table">
              <thead><tr><th>Protocolo</th><th>Direccion local</th><th>Puerto</th><th>Proceso</th><th>Estado</th></tr></thead>
              <tbody>
                ${parsed.ss.ports.map((p) => `
                  <tr>
                    <td>${escapeHtml(p.protocol)}</td>
                    <td>${escapeHtml(p.localAddress)}</td>
                    <td>${escapeHtml(p.port)}</td>
                    <td>${escapeHtml(p.processName)}</td>
                    <td>${escapeHtml(p.state)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="summary-detail">Review any service you do not recognize.</div>`
          : `<div class="empty-state">No data parsed yet.</div>`
      }
    </div>
  `);

  // ls -la
  blocks.push(`
    <div class="result-card">
      <h3>ls -la</h3>
      ${
        parsed.ls?.entries?.length
          ? `<table class="data-table">
              <thead><tr><th>Permisos</th><th>Owner</th><th>Group</th><th>Size</th><th>Archivo</th><th>Nota</th></tr></thead>
              <tbody>
                ${parsed.ls.entries.map((e) => `
                  <tr class="${e.worldWritable ? 'row-warning' : ''}">
                    <td>${escapeHtml(e.permissions)}</td>
                    <td>${escapeHtml(e.owner)}</td>
                    <td>${escapeHtml(e.group)}</td>
                    <td>${escapeHtml(e.size)}</td>
                    <td>${escapeHtml(e.filename)}</td>
                    <td>${e.worldWritable ? 'review recommended' : ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>`
          : `<div class="empty-state">No data parsed yet.</div>`
      }
    </div>
  `);

  // whoami + groups juntos porque son datos simples
  blocks.push(`
    <div class="result-card">
      <h3>whoami / groups</h3>
      ${
        parsed.whoami?.username || parsed.groups?.groups?.length
          ? `<div class="summary-detail">
              Usuario: ${escapeHtml(parsed.whoami?.username || '-')}<br />
              Grupos: ${escapeHtml((parsed.groups?.groups || []).join(', ') || '-')}
            </div>`
          : `<div class="empty-state">No data parsed yet.</div>`
      }
    </div>
  `);

  return `
    <section class="section">
      <div class="section-heading">
        <h2>Resultados parseados</h2>
        <p>Datos extraidos directamente de lo que pegaste, sin modificaciones</p>
      </div>
      <div class="results-stack">${blocks.join('')}</div>
    </section>
  `;
}

// ---- renderizado: checklist ----

function renderChecklist() {
  const items = state.checklist.map((item) => `
    <label class="checklist-item ${item.done ? 'done' : ''}">
      <input type="checkbox" data-checklist-id="${item.id}" ${item.done ? 'checked' : ''} />
      <span>${escapeHtml(item.label)}</span>
    </label>
  `).join('');

  const doneCount = state.checklist.filter((c) => c.done).length;

  return `
    <section class="section">
      <div class="section-heading">
        <h2>Checklist de seguridad</h2>
        <p class="checklist-progress">${doneCount}/${state.checklist.length} completados</p>
      </div>
      <div class="checklist">${items}</div>
    </section>
  `;
}

// ---- renderizado: reporte ----

function renderReport() {
  const markdown = buildMarkdownReport(state);
  return `
    <section class="section">
      <div class="section-heading">
        <h2>Reporte en Markdown</h2>
        <p>Se genera solo con la informacion que ya parseaste</p>
      </div>
      <div class="report-preview">${escapeHtml(markdown)}</div>
      <div class="report-actions">
        <button class="btn btn-primary" data-action="copy-report">Copiar reporte</button>
        <button class="btn" data-action="download-report">Descargar .md</button>
        <button class="btn btn-ghost btn-danger" data-action="reset-all">Reiniciar todos los datos</button>
      </div>
    </section>
  `;
}

// ---- renderizado: pie de pagina ----

function renderFooter() {
  return `
    <footer class="app-footer">
      <span>Linux Audit Helper: proyecto educativo, 100% local, sin backend.</span>
      <span>Todo el procesamiento ocurre en tu navegador.</span>
    </footer>
  `;
}

// ---- renderizado principal ----

function render() {
  const app = document.getElementById('app');
  const scrollY = window.scrollY;

  app.innerHTML = `
    ${renderHeader()}
    ${renderSummary()}
    ${renderPanels()}
    ${renderResults()}
    ${renderChecklist()}
    ${renderReport()}
    ${renderFooter()}
  `;

  window.scrollTo(0, scrollY);
  attachEvents();
}

// ---- conexion de eventos ----

function attachEvents() {
  document.querySelectorAll('[data-input-id]').forEach((textarea) => {
    textarea.addEventListener('input', (e) => {
      const id = e.target.dataset.inputId;
      state.rawInputs[id] = e.target.value;
      persist();
    });
  });

  document.querySelectorAll('[data-action="parse"]').forEach((btn) => {
    btn.addEventListener('click', () => handleParse(btn.dataset.id));
  });

  document.querySelectorAll('[data-action="clear"]').forEach((btn) => {
    btn.addEventListener('click', () => handleClear(btn.dataset.id));
  });

  document.querySelectorAll('[data-checklist-id]').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      handleChecklistToggle(e.target.dataset.checklistId, e.target.checked);
    });
  });

  const copyBtn = document.querySelector('[data-action="copy-report"]');
  if (copyBtn) copyBtn.addEventListener('click', handleCopyReport);

  const downloadBtn = document.querySelector('[data-action="download-report"]');
  if (downloadBtn) downloadBtn.addEventListener('click', handleDownloadReport);

  const resetBtn = document.querySelector('[data-action="reset-all"]');
  if (resetBtn) resetBtn.addEventListener('click', handleResetAll);
}

// ---- manejadores ----

function handleParse(id) {
  const cmd = COMMANDS.find((c) => c.id === id);
  if (!cmd) return;

  const raw = state.rawInputs[id] || '';
  // corremos el parser correspondiente sobre el texto pegado
  state.parsed[id] = cmd.parser(raw);
  persist();
  render();
  showToast('Datos guardados');
}

function handleClear(id) {
  state.rawInputs[id] = '';
  state.parsed[id] = null;
  persist();
  render();
  showToast('Entrada limpiada');
}

function handleChecklistToggle(id, done) {
  const item = state.checklist.find((c) => c.id === id);
  if (!item) return;
  item.done = done;
  persist();
  render();
}

async function handleCopyReport() {
  const markdown = buildMarkdownReport(state);
  try {
    await navigator.clipboard.writeText(markdown);
    showToast('Reporte copiado');
  } catch (err) {
    showToast('No se pudo copiar el reporte');
  }
}

function handleDownloadReport() {
  const markdown = buildMarkdownReport(state);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'linux-audit-report.md';
  link.click();
  URL.revokeObjectURL(url);
  showToast('Reporte descargado');
}

function handleResetAll() {
  const confirmed = window.confirm('Esto va a borrar todos los datos guardados localmente. Continuar?');
  if (!confirmed) return;
  state = resetState();
  render();
  showToast('Todos los datos fueron reiniciados');
}

render();
