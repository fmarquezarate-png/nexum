# Plantico — fase 2, sin implementar

Riego inteligente para plantas de interior. Bomba de agua, depósito rellenable,
sensor de humedad en el sustrato y riego por goteo.

**No escribir código aquí todavía.** La carpeta existe para verificar que la
arquitectura aguanta un módulo nuevo.

## Cuando llegue su turno

Tablas ya creadas (vacías y sin usar):

- `plantico_devices` — especie, volumen de maceta, humedad objetivo, caudal de la bomba
- `plantico_state` — humedad del sustrato, nivel del depósito, último y próximo riego
- `plantico_watering_log` — historial de riegos

Diferencia clave con Coolio: **el sensor de humedad sí lee de verdad**. Plantico
no tiene el problema de la unidireccionalidad del infrarrojo. Su `plantico_state`
es un estado real, no un estado ordenado.

Paso a paso en `docs/adding-a-module.md`.
