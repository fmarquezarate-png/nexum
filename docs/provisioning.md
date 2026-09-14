# Emparejado de dispositivos

## El objetivo

Que configures cada dispositivo **una sola vez**, desde el móvil, sin cables ni
herramientas. Y que después sobreviva solo a cortes de luz y cambios de WiFi.

## Los siete pasos

**1.** El ESP32 sin configurar arranca como punto de acceso WiFi:
`Nexum-XXXX` (las X son los últimos dígitos de su MAC).

**2.** En la app pulsas **"Añadir dispositivo"**. Eliges casa y habitación. La
app pide a la función `provision-device` un **token de reclamo**: un código de
un solo uso, válido 10 minutos, ligado a esa casa y habitación.

**3.** La app te muestra el token y te guía para conectarte a la red
`Nexum-XXXX` desde los ajustes del móvil.

**4.** Se abre solo el **portal cautivo** del dispositivo (la pantallita que
sale al conectarse a un WiFi de hotel). Eliges tu red de casa, metes la
contraseña y pegas el token.

**5.** El dispositivo se conecta a Internet, se registra contra el backend con
el token y recibe **sus credenciales MQTT propias**.

**6.** El backend crea la fila en `devices`, consume el token (ya no sirve más)
y avisa a la app por Realtime.

**7.** La app pasa a la configuración de Coolio: marca y modelo del aire, y
prueba de emisión IR para confirmar que el aparato responde.

## Vocabulario

| Término | Qué es |
|---|---|
| **Portal cautivo** | La pantalla que aparece automáticamente al conectarte a un WiFi público. El ESP32 monta una igual para configurarse |
| **Token de reclamo** | Un código de un solo uso, corto y con caducidad, que demuestra que quien registra el dispositivo tiene permiso |
| **Credenciales MQTT** | El usuario y contraseña del dispositivo en el broker. Únicos suyos |

## Por qué un token de un solo uso

Sin él, cualquiera que conociera la dirección del backend podría registrar
dispositivos fantasma en casas ajenas.

El token lo genera alguien que **ya es `admin` u `owner`** de la casa, caduca
en 10 minutos y se consume al usarse. Ata el aparato físico a una casa concreta
con permiso comprobado.

## Requisitos del firmware

- **Conservar la configuración tras un corte de luz** y reconectar solo.
- **Reset de fábrica por pulsación larga**: borra WiFi y credenciales y vuelve
  al portal cautivo.
- La contraseña MQTT **solo se entrega una vez**, en el paso 5. Si se pierde,
  hay que re-emparejar.

## Si algo falla

| Síntoma | Causa probable | Solución |
|---|---|---|
| No aparece la red `Nexum-XXXX` | El dispositivo ya está configurado, o no tiene corriente | Reset de fábrica por pulsación larga |
| El portal cautivo no se abre solo | Android a veces no lo lanza | Abrir el navegador y entrar a `192.168.4.1` |
| "Token caducado" | Pasaron más de 10 minutos | Volver al paso 2 y pedir uno nuevo |
| Se conecta pero no aparece en la app | Contraseña del WiFi mal, o red de 5 GHz | El ESP32 solo va en 2,4 GHz |
| El aire no responde a la prueba IR | Emisor mal apuntado o protocolo equivocado | Apuntar al receptor del split; probar otro protocolo |

> El ESP32 **no funciona en redes WiFi de 5 GHz**. Solo 2,4 GHz. Es la causa
> número uno de emparejados fallidos.
