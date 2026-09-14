# Arquitectura de Nexum

## La idea en una frase

Nexum es una app paraguas de gestión del hogar. Cada categoría de dispositivo
(clima, riego, luces…) es un **módulo** con su propia cara y su propia lógica,
pero todos comparten cuenta, casas, habitaciones, permisos, notificaciones y
automatizaciones.

Analogía: Nexum es el centro comercial; Coolio y Plantico son las tiendas. Cada
tienda decora su escaparate como quiera, pero el parking, la seguridad y los
horarios son del centro comercial.

## El dibujo

```
┌─────────────────┐
│  App (Expo RN)  │   iOS y Android desde el mismo código
└────────┬────────┘
         │ HTTPS autenticado (JWT de Supabase)
         ▼
┌─────────────────────────────────────────┐
│  Supabase                               │
│  • Postgres + RLS  • Auth  • Realtime   │
│  • Edge Functions (publican comandos)   │
└────────┬───────────────────────▲────────┘
         │ publish                │ escribe estado y telemetría
         ▼                        │
┌─────────────────┐      ┌────────┴─────────────┐
│  HiveMQ Cloud   │◄────►│  mqtt-bridge         │
│  (broker MQTT)  │      │  (servicio Node 24/7)│
└────────┬────────┘      └──────────────────────┘
         │ TLS, credenciales propias por dispositivo
         ▼
┌─────────────────┐
│  ESP32          │──IR 940 nm──► Split de aire acondicionado
│  + SHT31        │
└─────────────────┘
```

## Vocabulario

| Término | Qué es, en cristiano |
|---|---|
| **Supabase** | Un Postgres en la nube con autenticación, permisos y suscripciones en vivo ya montados |
| **Postgres** | La base de datos donde vive todo |
| **RLS** | Reglas de seguridad dentro de la propia base de datos: deciden fila a fila quién ve qué |
| **Auth** | El sistema de cuentas: registro, login, contraseñas |
| **Realtime** | Suscripción en vivo: la app se entera al instante de que una fila cambió, sin preguntar cada segundo |
| **Edge Function** | Un trocito de backend que se despierta cuando lo llamas, hace su trabajo y se apaga |
| **MQTT** | El "lenguaje" de mensajes cortos que usan los dispositivos. Como una radio: uno publica, otros escuchan |
| **Broker** | El servidor MQTT que reparte los mensajes. Aquí, HiveMQ Cloud |
| **JWT** | El carné de identidad digital que la app enseña al backend en cada petición |
| **LWT** | *Last Will and Testament*: el mensaje que el broker publica en tu nombre si te caes sin avisar |

## Los cuatro principios que no se negocian

### 1. La app nunca habla MQTT

La app **no lleva credenciales del broker**. Si las llevara, cualquiera que
descargara el APK podría sacarlas y controlar dispositivos ajenos.

Todo pasa por el backend, que primero comprueba identidad y permisos y solo
entonces publica.

### 2. Cada dispositivo tiene credenciales propias

Cada ESP32 tiene su usuario y contraseña en el broker, con permiso **solo**
para sus propios topics. Si alguien abriera una placa y sacara sus claves,
podría trastear con ese aparato y con ninguno más.

### 3. El backend es la única fuente de verdad sobre permisos

El firmware no sabe nada de usuarios, invitados ni códigos. Obedece los
comandos que llegan por su topic. La pregunta "¿puede este señor encender este
aire?" se responde **una sola vez**, en el backend, antes de publicar.

### 4. Toda orden queda registrada

Cada comando se guarda en la tabla `commands` con quién lo emitió y cuándo.
Esto es **obligatorio**, no opcional: hay acceso de invitados y hay que poder
auditar qué hizo cada uno.

## Por qué hace falta `mqtt-bridge`

Las Edge Functions son *serverless*: se despiertan, ejecutan y mueren.
Perfectas para **publicar** un comando (conectar, publicar, desconectar).

Pero para **recibir** telemetría hace falta alguien conectado las 24 horas
esperando mensajes. Una función que se apaga no puede esperar.

Por eso existe `services/mqtt-bridge`: un servicio Node pequeño y permanente
que mantiene la suscripción abierta, escribe en Supabase lo que recibe, marca
dispositivos como offline cuando llega su LWT y reconcilia comandos sin
confirmar.

Se despliega en Railway o Fly.io. Es *stateless*: se puede reiniciar en
cualquier momento sin perder nada.

## La limitación del infrarrojo (importante)

El emisor IR **solo emite**. El ESP32 le habla al aire acondicionado pero no
puede leer su estado. Si alguien usa el mando físico, Nexum no se entera.

Consecuencia en el diseño: la tabla `coolio_state` guarda **el último estado
que Nexum ordenó**, no el estado real del aparato.

La app está obligada a:

1. Mostrar la hora del último comando junto al estado: *"Según el último
   cambio, hace 2 h"*.
2. Ofrecer un botón de **Resincronizar** que reenvía el estado completo.
3. **No presentar nunca** el estado como una lectura verificada.

La temperatura y humedad del SHT31 **sí** son lecturas reales y deben mostrarse
claramente diferenciadas del estado del aire.

## Cómo se mueve un comando, de principio a fin

1. Fran pulsa "24 °C" en el móvil.
2. La app llama a la Edge Function `send-command` con su JWT.
3. La función pregunta a la base de datos `can_control_device(...)`. Si no,
   devuelve `403` y ahí acaba todo.
4. Inserta una fila en `commands` con estado `pending`.
5. Se conecta al broker y publica en `nexum/{home}/{device}/cmd`. Marca `sent`.
6. El ESP32 recibe el mensaje, emite la ráfaga IR y publica en `/ack`.
7. `mqtt-bridge`, que estaba escuchando, marca la fila como `acked` y actualiza
   `coolio_state`.
8. La app, suscrita por Realtime, ve el cambio y actualiza la pantalla sola.

Si el paso 6 nunca llega, el reconciliador de `mqtt-bridge` marca el comando
como `timeout` y avisa.
