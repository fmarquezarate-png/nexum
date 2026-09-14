/**
 * Módulo Coolio — climatización por infrarrojos.
 *
 * Estado: estructura creada. Implementación en la fase 2.
 *
 * ⚠ LIMITACIÓN QUE DEBE REFLEJARSE EN TODA LA INTERFAZ DE ESTE MÓDULO ⚠
 *
 * El infrarrojo es UNIDIRECCIONAL. El ESP32 le habla al aire acondicionado,
 * pero no puede leer su estado real. Si alguien usa el mando físico, Nexum
 * no se entera.
 *
 * Consecuencias obligatorias en la interfaz:
 *   1. El estado se muestra SIEMPRE con su marca de tiempo:
 *      "Según el último cambio, hace 2 h".
 *   2. Tiene que haber un botón de RESINCRONIZAR que reenvía el estado
 *      completo al aire.
 *   3. Nunca se presenta el estado como una lectura verificada.
 *   4. La temperatura y humedad del sensor SHT31 SÍ son reales y se
 *      muestran claramente separadas del estado del aire.
 *
 * La tarjeta de "Recomendación IA" del mockup queda FUERA de la fase 1:
 * se deja el hueco en la interfaz, sin lógica detrás.
 */

export {};
