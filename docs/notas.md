# notas

proyecto para practicar auditoria basica de linux sin ejecutar nada, solo pegando salidas de comandos.

## como funciona
pegas la salida de ip a / df -h / ss -tulpen / ls -la / whoami / groups y lo parsea todo local, sin backend. queda guardado en localStorage.

## por que no ejecuta comandos
para que sea 100% seguro correrlo en el navegador sin pedir permisos raros. si algun dia lo extiendo con backend, ahi si podria ejecutar en un entorno controlado.

## pendientes / ideas
- soportar mas comandos (ps aux, systemctl, crontab -l)
- exportar/importar sesion en json
- tema claro
- mejorar mobile en las tablas

## nota
solo para analizar sistemas propios o con permiso.
