// parsea la salida de "ls -la" para revisar permisos de archivos

export function parsePermissions(rawText) {
  if (!rawText || !rawText.trim()) {
    return { entries: [] };
  }

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const entries = [];

  const permRegex = /^([dl\-])([rwx\-]{9})/;

  for (const line of lines) {
    // saltamos la linea "total N" que aparece al inicio
    if (/^total\s+\d+/.test(line)) continue;

    const permMatch = line.match(permRegex);
    if (!permMatch) continue;

    const parts = line.split(/\s+/);
    if (parts.length < 9) continue;

    const permissions = parts[0];
    const owner = parts[2];
    const group = parts[3];
    const size = parts[4];
    const filename = parts.slice(8).join(' ');

    // el permiso de escritura para "otros" esta en la posicion 8 del string
    const othersWrite = permissions[8] === 'w';

    entries.push({
      permissions,
      owner,
      group,
      size,
      filename,
      worldWritable: othersWrite
    });
  }

  return { entries };
}
