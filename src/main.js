// primera prueba: parsear la salida de "ip a" pegada a mano

function parseIp(text) {
  const lines = text.split('\n');
  const interfaces = [];
  let current = null;

  for (const line of lines) {
    const headerMatch = line.match(/^\d+:\s+([^:@]+)/);
    if (headerMatch) {
      if (current) interfaces.push(current);
      current = { name: headerMatch[1].trim(), ips: [] };
      continue;
    }
    const ipMatch = line.match(/inet\s+([0-9.]+)/);
    if (ipMatch && current) {
      current.ips.push(ipMatch[1]);
    }
  }
  if (current) interfaces.push(current);
  return interfaces;
}

const app = document.getElementById('app');

app.innerHTML = `
  <h1>Linux Audit Helper</h1>
  <p>Pega la salida de "ip a" para probar el parser.</p>
  <textarea id="input" placeholder="pegar aca la salida de ip a"></textarea>
  <br />
  <button id="parseBtn">Parsear</button>
  <pre id="output">esperando datos...</pre>
`;

document.getElementById('parseBtn').addEventListener('click', () => {
  const text = document.getElementById('input').value;
  const result = parseIp(text);
  document.getElementById('output').textContent = JSON.stringify(result, null, 2);
});
