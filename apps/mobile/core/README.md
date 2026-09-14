# core/ — el núcleo compartido

Todo lo que usan **todos** los módulos vive aquí. Si una funcionalidad la
necesitaría también Plantico, Iluminación o Seguridad, es núcleo.

| Carpeta | Responsabilidad |
|---|---|
| `auth/` | Sesión, registro, login, recuperación de contraseña |
| `homes/` | Casas, miembros, códigos de invitado |
| `rooms/` | Habitaciones |
| `devices/` | Lista de dispositivos, alta, emparejado, estado online |
| `permissions/` | Roles y comprobaciones en la interfaz (no sustituyen a RLS) |
| `notifications/` | Tokens push y avisos |
| `automations/` | Automatizaciones y escenas |

## La regla que protege todo esto

**`core/` no puede importar nada de `modules/`.**

La flecha va en un solo sentido: los módulos usan el núcleo, el núcleo no
conoce a los módulos. Si alguna vez escribes `import ... from '../modules/coolio'`
dentro de `core/`, has roto la arquitectura y añadir Plantico dejará de ser
gratis.

La única excepción controlada es `ui/theme.ts`, que tiene un mapa de temas por
módulo. Es un mapa de datos, no lógica.

## Nota sobre `permissions/`

Lo que haya aquí sirve para **decidir qué se dibuja** (ocultar el botón de
encender a un invitado). **No es seguridad.** La seguridad de verdad está en
las políticas RLS de la base de datos, que no se pueden saltar desde la app.
Ver `docs/permissions.md`.
