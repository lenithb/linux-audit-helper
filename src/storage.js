// guardamos lo que se pega para no perderlo si se recarga la pagina

const KEY = "linux-audit-helper-inputs";

export function loadInputs() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

export function saveInputs(inputs) {
  localStorage.setItem(KEY, JSON.stringify(inputs));
}
