# modules/ — los módulos verticales

Cada carpeta es un producto con su propia identidad: Coolio (clima), Plantico
(riego) y los que vengan.

## Qué puede haber dentro de un módulo

- Pantallas y componentes propios (el dial de temperatura de Coolio)
- Lógica propia (qué significa "modo seco")
- Su tema visual

## Qué NO puede haber dentro de un módulo

- Nada de autenticación, casas, habitaciones, permisos, notificaciones ni
  automatizaciones. Todo eso es núcleo y se importa de `core/`.
- Consultas directas a tablas del núcleo. Se pasa por `core/`.

## Estructura estándar de un módulo

```
modules/<nombre>/
├── index.ts          Lo que el módulo expone al resto de la app
├── theme.ts          Color e identidad (o entrada en ui/theme.ts)
├── DeviceDetail.tsx  Pantalla de detalle que enruta app/devices/[id]
└── components/       Piezas propias
```

Ver `docs/adding-a-module.md` para el paso a paso completo.
