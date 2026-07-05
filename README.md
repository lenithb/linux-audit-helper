# Linux Audit Helper

App para practicar lectura de auditoria basica de Linux. Pegas la salida de un comando y te arma un dashboard con la info organizada. No ejecuta nada, todo corre en el navegador.

## que hace

- parsea `ip a`, `df -h`, `ss -tulpen`, `ls -la`, `whoami` y `groups`
- dashboard con resumen (ips, puertos abiertos, uso de disco, permisos raros)
- checklist de seguridad basico guardado en localStorage
- genera un reporte en markdown, se puede copiar o descargar
- boton para resetear todo

## stack

Vite + JS vanilla, sin frameworks. Sin backend, sin base de datos, sin apis externas.

## instalar y correr

```bash
npm install
npm run dev
```

build de produccion:

```bash
npm run build
npm run preview
```

## comandos para probar

corre esto en tu terminal y pega la salida en el panel correspondiente:

```bash
ip a
df -h
ss -tulpen
ls -la
whoami
groups
```

## nota

no ejecuta comandos ni escanea nada, solo interpreta texto que vos ya obtuviste. usalo en sistemas propios o donde tengas permiso para auditar. mas detalle en `docs/notas.md`.

## estructura

```txt
src/
├── main.js
├── styles.css
├── parsers/
│   ├── parseIp.js
│   ├── parseDisk.js
│   ├── parsePorts.js
│   ├── parsePermissions.js
│   ├── parseUser.js
│   └── parseGroups.js
├── storage.js
├── report.js
└── ui.js
docs/
└── notas.md
```
