// parsea la salida de "df -h" linea por linea

export function parseDisk(rawText) {
  if (!rawText || !rawText.trim()) {
    return { volumes: [] };
  }

  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const volumes = [];

  for (const line of lines) {
    // saltamos el encabezado de la tabla
    if (/^Filesystem/i.test(line)) continue;

    const parts = line.split(/\s+/);
    if (parts.length < 6) continue;

    const [filesystem, size, used, avail, usePercent, ...mountParts] = parts;
    const percentNumber = parseInt(usePercent.replace("%", ""), 10);

    volumes.push({
      filesystem,
      size,
      used,
      available: avail,
      usePercent: usePercent,
      usePercentNumber: isNaN(percentNumber) ? 0 : percentNumber,
      mountedOn: mountParts.join(" "),
      warning: !isNaN(percentNumber) && percentNumber >= 80,
    });
  }

  return { volumes };
}
