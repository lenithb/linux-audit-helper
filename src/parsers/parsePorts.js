// parsea la salida de "ss -tulpen" para listar puertos en escucha

export function parsePorts(rawText) {
  if (!rawText || !rawText.trim()) {
    return { ports: [] };
  }

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const ports = [];

  for (const line of lines) {
    // saltamos el encabezado
    if (/^Netid/i.test(line)) continue;

    const parts = line.split(/\s+/);
    if (parts.length < 5) continue;

    const protocol = parts[0];
    const state = /^(tcp|udp)$/i.test(protocol) ? (parts[1] && /LISTEN|UNCONN/i.test(parts[1]) ? parts[1] : 'LISTEN') : parts[1];

    // buscamos la columna de direccion local, suele tener formato ip:puerto
    const localAddrField = parts.find((p) => /:[0-9]+$/.test(p));
    let localAddress = '';
    let port = '';
    if (localAddrField) {
      const lastColon = localAddrField.lastIndexOf(':');
      localAddress = localAddrField.slice(0, lastColon);
      port = localAddrField.slice(lastColon + 1);
    }

    // el nombre del proceso suele venir entre comillas en users:(("nombre",pid=...))
    let processName = '';
    const processMatch = line.match(/users:\(\("([^"]+)"/);
    if (processMatch) {
      processName = processMatch[1];
    }

    if (!localAddrField) continue;

    ports.push({
      protocol,
      state,
      localAddress,
      port,
      processName: processName || 'desconocido',
      listening: /LISTEN|UNCONN/i.test(state)
    });
  }

  return { ports };
}
