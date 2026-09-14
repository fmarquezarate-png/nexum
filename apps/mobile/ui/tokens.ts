/**
 * Design system de Nexum — los "tokens".
 *
 * Un token es un valor con nombre: en vez de escribir '#1E5B45' en veinte
 * sitios, escribes colors.brand.primary. El día que cambie el verde, se
 * cambia aquí y cambia en toda la app.
 *
 * Es exactamente la misma idea que una medida DAX: la fórmula vive en un
 * sitio y todos los visuales la usan.
 *
 * REGLA: en el código de las pantallas no debe aparecer NUNCA un color
 * escrito a mano ni un número de espaciado suelto. Siempre desde aquí.
 *
 * Paleta tomada de los mockups de Nexum, Coolio y Plantico.
 */

// ─── Colores base (los comparte toda la app) ─────────────────────────

export const palette = {
  /** Verde Nexum, del logo de la casa con la hoja. */
  green900: '#0F2F23',
  green700: '#14402F',
  green600: '#1E5B45',
  green500: '#2A7659',
  green100: '#E3EDE7',

  /** Cyan Coolio, de las ondas del logo. */
  cyan700: '#0E2748',
  cyan500: '#21B6E0',
  cyan300: '#7FD7EF',
  cyan100: '#E9F7FC',

  /** Verde y agua de Plantico. */
  leaf600: '#2F7A57',
  water500: '#3BA7D6',
  leaf100: '#EBF2EC',

  /** Neutros. El fondo crema es la seña de identidad de Nexum. */
  cream: '#F5F2EC',
  white: '#FFFFFF',
  ink: '#14201B',
  inkMuted: '#6E7D76',
  inkFaint: '#9AA6A0',
  border: '#E5E0D6',

  /** Estados. */
  success: '#2E9E5B',
  warning: '#E0A93B',
  danger: '#D2553F',
  offline: '#9AA6A0',
} as const;

// ─── Colores semánticos ──────────────────────────────────────────────
// Se usan estos, no los de arriba: dicen PARA QUÉ sirve el color, no
// cuál es. Así, cuando llegue el modo oscuro, solo cambia este bloque.

export const colors = {
  background: palette.cream,
  surface: palette.white,
  surfaceAlt: palette.green100,
  border: palette.border,

  text: palette.ink,
  textMuted: palette.inkMuted,
  textFaint: palette.inkFaint,
  textOnBrand: palette.white,

  brand: palette.green600,
  brandDark: palette.green700,

  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  offline: palette.offline,
} as const;

// ─── Espaciado ───────────────────────────────────────────────────────
// Escala de 4 en 4. Todos los márgenes salen de aquí: así nada queda
// "casi alineado".

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ─── Bordes redondeados ──────────────────────────────────────────────

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

// ─── Tipografía ──────────────────────────────────────────────────────

export const typography = {
  display: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: '700' },
  heading: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodyStrong: { fontSize: 16, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '400' },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
} as const;

// ─── Sombras ─────────────────────────────────────────────────────────
// iOS y Android usan sistemas distintos, por eso van los dos valores.

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

/** Ancho mínimo de cualquier zona pulsable. Por debajo de 44 px se falla al tocar. */
export const HIT_TARGET = 44;
