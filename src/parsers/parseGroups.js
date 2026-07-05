// parsea la salida de "groups", separando por espacios

export function parseGroups(rawText) {
  if (!rawText || !rawText.trim()) {
    return { groups: [] };
  }

  // a veces el comando devuelve "usuario : grupo1 grupo2", quitamos esa parte
  const cleaned = rawText.trim().split(":").pop();
  const groups = cleaned
    .split(/\s+/)
    .map((g) => g.trim())
    .filter(Boolean);

  return { groups };
}
