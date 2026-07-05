// parsea la salida de "ip a" y devuelve una lista de interfaces con sus ips

export function parseIp(rawText) {
  if (!rawText || !rawText.trim()) {
    return { interfaces: [] };
  }

  const lines = rawText.split('\n');
  const interfaces = [];
  let current = null;

  const ifaceHeaderRegex = /^\d+:\s+([^:@]+)(@\S+)?:\s+<([^>]*)>/;
  const ipv4Regex = /inet\s+([0-9.]+)\/\d+/;
  const ipv6Regex = /inet6\s+([0-9a-fA-F:]+)\/\d+/;

  for (const line of lines) {
    const headerMatch = line.match(ifaceHeaderRegex);
    if (headerMatch) {
      // nueva interfaz detectada, guardamos la anterior si existe
      if (current) interfaces.push(current);
      const flags = headerMatch[3] || '';
      current = {
        name: headerMatch[1].trim(),
        state: flags.includes('UP') ? 'UP' : 'DOWN',
        ipv4: [],
        ipv6: []
      };
      continue;
    }

    if (!current) continue;

    const ipv4Match = line.match(ipv4Regex);
    if (ipv4Match) {
      current.ipv4.push(ipv4Match[1]);
    }

    const ipv6Match = line.match(ipv6Regex);
    if (ipv6Match) {
      current.ipv6.push(ipv6Match[1]);
    }
  }

  if (current) interfaces.push(current);

  return { interfaces };
}
