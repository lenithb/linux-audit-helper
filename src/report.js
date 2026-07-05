// generamos el reporte usando solo la informacion parseada, nada se inventa

export function buildMarkdownReport(state) {
  const { parsed, checklist } = state;
  const date = new Date().toLocaleString();

  const lines = [];
  lines.push('# Reporte de Auditoria Linux');
  lines.push('');
  lines.push(`Generado el: ${date}`);
  lines.push('');

  lines.push('## Usuario');
  lines.push('');
  lines.push(parsed.whoami && parsed.whoami.username ? parsed.whoami.username : '_Sin datos parseados aun._');
  lines.push('');

  lines.push('## Grupos');
  lines.push('');
  if (parsed.groups && parsed.groups.groups && parsed.groups.groups.length) {
    lines.push(parsed.groups.groups.map((g) => `- ${g}`).join('\n'));
  } else {
    lines.push('_Sin datos parseados aun._');
  }
  lines.push('');

  lines.push('## Interfaces de red');
  lines.push('');
  if (parsed.ip && parsed.ip.interfaces && parsed.ip.interfaces.length) {
    for (const iface of parsed.ip.interfaces) {
      lines.push(`### ${iface.name} (${iface.state})`);
      lines.push(`- IPv4: ${iface.ipv4.length ? iface.ipv4.join(', ') : 'ninguna'}`);
      lines.push(`- IPv6: ${iface.ipv6.length ? iface.ipv6.join(', ') : 'ninguna'}`);
      lines.push('');
    }
  } else {
    lines.push('_Sin datos parseados aun._');
    lines.push('');
  }

  lines.push('## Uso de disco');
  lines.push('');
  if (parsed.df && parsed.df.volumes && parsed.df.volumes.length) {
    lines.push('| Filesystem | Tamano | Usado | Disponible | Uso% | Punto de montaje |');
    lines.push('|---|---|---|---|---|---|');
    for (const v of parsed.df.volumes) {
      const flag = v.warning ? ' (alerta)' : '';
      lines.push(`| ${v.filesystem} | ${v.size} | ${v.used} | ${v.available} | ${v.usePercent}${flag} | ${v.mountedOn} |`);
    }
  } else {
    lines.push('_Sin datos parseados aun._');
  }
  lines.push('');

  lines.push('## Puertos en escucha');
  lines.push('');
  if (parsed.ss && parsed.ss.ports && parsed.ss.ports.length) {
    lines.push('| Protocolo | Direccion local | Puerto | Proceso | Estado |');
    lines.push('|---|---|---|---|---|');
    for (const p of parsed.ss.ports) {
      lines.push(`| ${p.protocol} | ${p.localAddress} | ${p.port} | ${p.processName} | ${p.state} |`);
    }
  } else {
    lines.push('_Sin datos parseados aun._');
  }
  lines.push('');

  lines.push('## Revision de permisos');
  lines.push('');
  if (parsed.ls && parsed.ls.entries && parsed.ls.entries.length) {
    lines.push('| Permisos | Owner | Group | Tamano | Archivo | Nota |');
    lines.push('|---|---|---|---|---|---|');
    for (const e of parsed.ls.entries) {
      const note = e.worldWritable ? 'revisar recomendado' : '';
      lines.push(`| ${e.permissions} | ${e.owner} | ${e.group} | ${e.size} | ${e.filename} | ${note} |`);
    }
  } else {
    lines.push('_Sin datos parseados aun._');
  }
  lines.push('');

  lines.push('## Checklist');
  lines.push('');
  lines.push(checklist.map((item) => `- [${item.done ? 'x' : ' '}] ${item.label}`).join('\n'));
  lines.push('');

  lines.push('## Notas');
  lines.push('');
  lines.push('Este reporte es educativo y se basa unicamente en salidas de comandos pegadas manualmente.');
  lines.push('');

  return lines.join('\n');
}
