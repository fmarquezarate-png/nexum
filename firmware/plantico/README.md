# Firmware Plantico — fase 2

**No implementar todavía.** Carpeta reservada.

Hardware previsto: ESP32 + bomba de agua, sensor de humedad de sustrato,
sensor de nivel del depósito y riego por goteo.

Reutilizará el mismo contrato de transporte que Coolio (mismos topics, mismos
mensajes de `ack`, `state`, `telemetry` y `lwt`); solo cambian los `params` de
los comandos y los campos de estado.

Ventaja sobre Coolio: el sensor de humedad **lee de verdad**. Plantico no
arrastra el problema de la unidireccionalidad del infrarrojo, así que su
estado sí es un estado real.
