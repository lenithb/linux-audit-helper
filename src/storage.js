// manejo centralizado de localStorage para toda la app

const STORAGE_KEY = 'linux-audit-helper-state';

const DEFAULT_CHECKLIST = [
  { id: 'ports', label: 'Revisar puertos abiertos', done: false },
  { id: 'users', label: 'Revisar usuarios y grupos', done: false },
  { id: 'disk', label: 'Chequear uso de disco', done: false },
  { id: 'permissions', label: 'Revisar archivos con permisos de escritura para todos', done: false },
  { id: 'services', label: 'Revisar servicios en ejecucion manualmente', done: false },
  { id: 'updates', label: 'Mantener los paquetes del sistema actualizados', done: false },
  { id: 'passwords', label: 'Usar contrasenas fuertes', done: false },
  { id: 'firewall', label: 'Activar el firewall si corresponde', done: false },
  { id: 'ssh', label: 'Revisar la configuracion de SSH si esta habilitado', done: false }
];

function getDefaultState() {
  return {
    rawInputs: {
      ip: '',
      df: '',
      ss: '',
      ls: '',
      whoami: '',
      groups: ''
    },
    parsed: {
      ip: null,
      df: null,
      ss: null,
      ls: null,
      whoami: null,
      groups: null
    },
    checklist: DEFAULT_CHECKLIST
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    // combinamos con el default por si se agregaron campos nuevos despues
    return {
      ...getDefaultState(),
      ...parsed,
      rawInputs: { ...getDefaultState().rawInputs, ...(parsed.rawInputs || {}) },
      parsed: { ...getDefaultState().parsed, ...(parsed.parsed || {}) },
      checklist: parsed.checklist && parsed.checklist.length ? parsed.checklist : DEFAULT_CHECKLIST
    };
  } catch (err) {
    return getDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return getDefaultState();
}
