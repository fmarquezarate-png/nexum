# firmware/ — lo entrega otro agente

**En este repositorio NO se escribe firmware.** Estas carpetas existen para
alojar el código que entregue el agente de firmware y, sobre todo, para dejarle
por escrito el contrato que tiene que cumplir.

| Carpeta | Módulo | Estado |
|---|---|---|
| `coolio/` | Climatización por IR | Contrato definido, sin código |
| `plantico/` | Riego | Fase 2 |

La fuente de verdad del contrato es `packages/contracts/`. Los README de cada
carpeta lo reproducen para que el agente de firmware no tenga que leer el
repositorio entero.
