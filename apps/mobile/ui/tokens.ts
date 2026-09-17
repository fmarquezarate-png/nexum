import { Easing, type EasingFunction, type TextStyle } from 'react-native';

/**
 * Nexum — tokens de diseño.
 *
 * Un token es un valor con nombre. En vez de escribir '#1E5B45' en veinte
 * sitios, se escribe colors.brand. El día que cambie el verde, cambia aquí
 * y cambia en toda la app. Es la misma idea que una medida de Power BI:
 * la fórmula vive en un sitio y todos los visuales la usan.
 *
 * REGLAS
 *   1. En una pantalla NUNCA aparece un color escrito a mano ni un número
 *      de espaciado suelto. Todo sale de aquí.
 *   2. Los componentes consumen `colors` (semánticos) a través de useTheme().
 *      NUNCA importan de `palette`, que son los valores crudos.
 *   3. Ningún componente pregunta en qué modo está. Si necesita saberlo,
 *      es que falta un token.
 *
 * Especificación completa y razonada: docs/diseno/01-lenguaje-visual.md
 */

// ═══════════════════════════════════════════════════════════════════
//  Paleta base — valores crudos. Solo para construir `colors`.
// ═══════════════════════════════════════════════════════════════════

const palette = {
  // Cálidos: el crema de Nexum
  warm50: '#FDFCFA',
  warm100: '#FAF8F4',
  warm200: '#F2EFE9',
  warm300: '#E8E3D9',
  warm400: '#D8D2C6',
  white: '#FFFFFF',

  // Tintas: el verde-negro del logotipo
  ink900: '#101C17',
  ink700: '#33443C',
  ink500: '#5C6B63',
  ink400: '#7A8880',
  ink300: '#A6B0AA',

  // Verde Nexum
  green900: '#0C2B20',
  green800: '#10382A',
  green600: '#1E5B45',
  green500: '#2E7D5B',
  green200: '#CADCD2',
  green100: '#E4EDE8',

  // Cyan Coolio
  cyan800: '#0E2748',
  cyan600: '#1687B8',
  cyan500: '#1F9FD4',
  cyan300: '#7FD3EA',
  cyan100: '#E6F4FB',

  // Plantico
  leaf600: '#2E7D57',
  water500: '#3FA9D6',
  leaf100: '#E9F2EC',

  // Estados
  success600: '#2E9E5B',
  success100: '#DCF0E4',
  warning600: '#C98A14',
  warning100: '#FAEFD6',
  danger600: '#C8503A',
  danger100: '#FBE7E2',

  /** Tinte de todas las sombras. Cálido, nunca negro puro. */
  shadowInk: '#1C2B24',
} as const;

// ═══════════════════════════════════════════════════════════════════
//  Colores semánticos — lo único que consumen los componentes
// ═══════════════════════════════════════════════════════════════════

/**
 * El contrato de color. Ambos modos declaran exactamente estas claves,
 * así TypeScript avisa si al añadir un color se olvida el modo oscuro.
 */
export interface Colors {
  canvas: string;
  surface: string;
  surfaceElevated: string;
  surfaceOverlay: string;
  surfaceSunken: string;
  surfaceAccent: string;

  divider: string;
  borderInput: string;
  borderStrong: string;
  cardBorderWidth: number;
  cardBorder: string;

  scrim: string;

  text: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  textOnFill: string;

  brand: string;
  brandFill: string;
  brandPressed: string;
  brandSoft: string;
  brandInk: string;

  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  offline: string;

  /**
   * Fondo del QR. Siempre claro en los dos modos: un QR sobre fondo
   * oscuro no lo lee ninguna cámara, así que este es el único color
   * que no se invierte de noche.
   */
  surfaceQr: string;

  shadowInk: string;

  /** Barra de estado del sistema. Es un token para que ninguna pantalla pregunte por el modo. */
  statusBarStyle: 'light' | 'dark';
  /** Aspecto del teclado. Mismo motivo. */
  keyboardAppearance: 'light' | 'dark';
}

export const lightColors: Colors = {
  canvas: palette.warm100,
  surface: palette.white,
  surfaceElevated: palette.white,
  surfaceOverlay: palette.white,
  surfaceSunken: palette.warm200,
  surfaceAccent: palette.green100,

  divider: palette.warm300,
  borderInput: palette.warm300,
  borderStrong: palette.warm400,
  /** En claro la sombra ya separa la tarjeta; el borde sobraría. */
  cardBorderWidth: 0,
  cardBorder: 'transparent',

  scrim: '#101C17B3',

  text: palette.ink900,
  textSecondary: palette.ink500,
  /** Ratio 4.0:1 — solo a 15 pt o más. */
  textMuted: palette.ink400,
  /** Decorativo. Nunca texto informativo. */
  textFaint: palette.ink300,
  textOnFill: palette.white,

  brand: palette.green600,
  brandFill: palette.green600,
  brandPressed: palette.green800,
  brandSoft: palette.green100,
  brandInk: palette.green900,

  success: palette.success600,
  successSoft: palette.success100,
  warning: palette.warning600,
  warningSoft: palette.warning100,
  danger: palette.danger600,
  dangerSoft: palette.danger100,
  offline: palette.ink300,

  surfaceQr: palette.white,

  shadowInk: palette.shadowInk,
  statusBarStyle: 'dark',
  keyboardAppearance: 'light',
};

/**
 * Modo oscuro.
 *
 * El fondo NO es gris: mantiene el matiz cálido de la marca con el color
 * subido, porque a poca luz el ojo pierde sensibilidad al croma y un gris
 * neutro se percibe muerto.
 *
 * Los acentos suben luminancia y BAJAN saturación. Subir solo la
 * luminancia es lo que produce el efecto chillón.
 */
export const darkColors: Colors = {
  canvas: '#100F0B',
  surface: '#211E17',
  surfaceElevated: '#2B2721',
  surfaceOverlay: '#353028',
  surfaceSunken: '#0B0A07',
  surfaceAccent: '#15261C',

  divider: '#2E2A22',
  borderInput: '#38332A',
  borderStrong: '#443E33',
  /** En oscuro la sombra es invisible: el borde es lo único que separa. */
  cardBorderWidth: 1,
  cardBorder: '#38332A',

  scrim: '#000000CC',

  text: '#EDEAE3',
  textSecondary: '#B3ACA0',
  textMuted: '#918A7E',
  textFaint: '#6B6459',
  textOnFill: '#FFFFFF',

  brand: '#4FAE84',
  brandFill: '#2E7D5B',
  brandPressed: '#276A4D',
  brandSoft: '#15261C',
  brandInk: '#3E9773',

  success: '#5CBF83',
  successSoft: '#16281D',
  warning: '#E0B152',
  warningSoft: '#2A2213',
  danger: '#E8806A',
  dangerSoft: '#2C1A15',
  offline: '#6B6459',

  surfaceQr: palette.white,

  shadowInk: '#000000',
  statusBarStyle: 'light',
  keyboardAppearance: 'dark',
};

export type Scheme = 'light' | 'dark';

// ═══════════════════════════════════════════════════════════════════
//  Espaciado — escala de 4
// ═══════════════════════════════════════════════════════════════════

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

/** Medidas de maquetación. Se usan tal cual, no se recalculan. */
export const layout = {
  /** Margen lateral de TODA pantalla. */
  screenPaddingH: 20,
  screenPaddingTop: 12,
  /** Entre tarjetas de una misma lista. */
  cardGap: 12,
  /** Entre bloques con cabecera. */
  sectionGap: 28,
  cardPadding: 18,
  cardPaddingCompact: 14,
  rowHeight: 56,
  rowHeightCompact: 48,
  /** Mínimo pulsable. Por debajo de 44 se falla al tocar. */
  hitTarget: 44,
  /** Los círculos de la cabecera: avatar y botón de tema. Iguales. */
  avatar: 40,
  /** Aire al final del scroll para no quedar bajo la barra de pestañas. */
  scrollBottom: 96,
  tabBarHeight: 56,
} as const;

// ═══════════════════════════════════════════════════════════════════
//  Radios
// ═══════════════════════════════════════════════════════════════════

export const radius = {
  xs: 8,
  sm: 12,
  md: 14,
  lg: 18,
  /** Tarjeta estándar. */
  card: 22,
  /** Hoja modal, contenedor de dial. */
  sheet: 28,
  pill: 999,
} as const;

// ═══════════════════════════════════════════════════════════════════
//  Sombras — tres niveles y ni uno más
// ═══════════════════════════════════════════════════════════════════

export interface Sombra {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
}

/**
 * En oscuro las sombras no se desactivan: se reducen a cero. Así ningún
 * componente tiene que preguntar en qué modo está.
 */
export function shadowsFor(scheme: Scheme): Record<'subtle' | 'card' | 'raised', Sombra> {
  const tinte = scheme === 'dark' ? '#000000' : palette.shadowInk;
  const oscuro = scheme === 'dark';

  return {
    subtle: {
      shadowColor: tinte,
      shadowOpacity: oscuro ? 0 : 0.04,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: oscuro ? 0 : 1,
    },
    card: {
      shadowColor: tinte,
      shadowOpacity: oscuro ? 0 : 0.07,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 6 },
      elevation: oscuro ? 0 : 3,
    },
    raised: {
      shadowColor: tinte,
      shadowOpacity: oscuro ? 0 : 0.1,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
      elevation: oscuro ? 0 : 8,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
//  Tipografía
// ═══════════════════════════════════════════════════════════════════

/**
 * TODOS los estilos llevan interlineado explícito. No tenerlo era el
 * motivo principal de que la interfaz pareciera sin jerarquía.
 *
 * Se usa la letra del sistema (San Francisco en iOS, Roboto en Android).
 * No se carga una fuente propia: la personalidad la dan el color, el
 * radio y la sombra, y una fuente descargable añade peso y parpadeo.
 */
export const typography = {
  /** Dato protagonista: el 24°C del dial. UNO por pantalla. */
  dataHero: {
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '700',
    letterSpacing: -1.6,
    // Sin cifras de ancho fijo el número baila al pasar de 9 a 24.
    fontVariant: ['tabular-nums'],
    // Android añade ~6 px por arriba y por abajo con la métrica de la
    // fuente; sin esto el número queda descentrado dentro del dial.
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  dataHeroUnit: { fontSize: 24, lineHeight: 28, fontWeight: '600', letterSpacing: -0.4 },
  dataL: { fontSize: 34, lineHeight: 38, fontWeight: '700', letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  dataM: { fontSize: 22, lineHeight: 26, fontWeight: '700', letterSpacing: -0.3, fontVariant: ['tabular-nums'] },

  display: { fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.6 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.4 },
  section: { fontSize: 18, lineHeight: 24, fontWeight: '600', letterSpacing: -0.2 },
  cardTitle: { fontSize: 16, lineHeight: 22, fontWeight: '600' },

  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  captionStrong: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '600', letterSpacing: 0.6 },
  tabLabel: { fontSize: 10, lineHeight: 13, fontWeight: '600', letterSpacing: 0.2 },
} satisfies Record<string, TextStyle>;

// ═══════════════════════════════════════════════════════════════════
//  Movimiento
// ═══════════════════════════════════════════════════════════════════

export const duration = {
  /** Respuesta al dedo. */
  instant: 90,
  fast: 140,
  base: 200,
  slow: 280,
  screen: 320,
  data: 400,
} as const;

/**
 * Curvas. Nada de lineal (se percibe mecánico) ni de rebote en ningún
 * sitio: el único muelle permitido es `press`, calibrado para no producir
 * sobreimpulso visible.
 */
export const easing = {
  standard: [0.2, 0, 0, 1] as const,
  decelerate: [0.05, 0.7, 0.1, 1] as const,
  accelerate: [0.3, 0, 1, 1] as const,
  press: { damping: 18, stiffness: 320, mass: 1 } as const,
} as const;

/** Escala a la que encoge un BOTÓN al pulsarlo. */
export const PRESS_SCALE = 0.97;

/**
 * Escala de una TARJETA al pulsarla. Más contenida que la de un botón
 * porque el área es mucho mayor: el mismo 0.97 en una tarjeta ancha se
 * percibe como un salto.
 */
export const PRESS_SCALE_CARD = 0.985;

/** Entrada escalonada de una lista de tarjetas (§5.3 del lenguaje visual). */
export const stagger = {
  /** Desplazamiento de entrada. 8 y no 20: el gesto se insinúa, no se ejecuta. */
  translateY: 8,
  duration: 240,
  /** Retardo entre tarjetas consecutivas. */
  step: 40,
  /**
   * A partir de la séptima tarjeta todas entran con el retardo de la
   * sexta: si no, la última de una lista larga aparecería dos segundos
   * después que la primera.
   */
  max: 6,
} as const;

/** Pulso del esqueleto de carga. La única animación que pasa de 350 ms. */
export const SKELETON_CICLO = 1200;

/** Las curvas ya convertidas a funciones de Animated. */
export const curvas: Record<'standard' | 'decelerate' | 'accelerate', EasingFunction> = {
  standard: Easing.bezier(...easing.standard),
  decelerate: Easing.bezier(...easing.decelerate),
  accelerate: Easing.bezier(...easing.accelerate),
};

/**
 * Movimiento efectivo.
 *
 * Con "reducir movimiento" activado en el sistema, TODO desplazamiento y
 * toda escala pasan a 0 ms y solo queda un fundido de 100 ms. Lo resuelve
 * el proveedor de tema: ninguna pantalla consulta el ajuste, igual que
 * con el modo oscuro.
 */
export interface Motion {
  /** true si el sistema pide movimiento reducido. */
  reducido: boolean;
  instant: number;
  fast: number;
  base: number;
  slow: number;
  screen: number;
  data: number;
  /** Desplazamiento de entrada de las tarjetas, en px. 0 si hay movimiento reducido. */
  translateY: number;
  /** Retardo entre tarjetas. 0 si hay movimiento reducido. */
  step: number;
  /** Escala de pulsación. 1 (sin escala) si hay movimiento reducido. */
  escalaBoton: number;
  escalaTarjeta: number;
}

export function motionFor(reducido: boolean): Motion {
  if (!reducido) {
    return {
      reducido: false,
      ...duration,
      translateY: stagger.translateY,
      step: stagger.step,
      escalaBoton: PRESS_SCALE,
      escalaTarjeta: PRESS_SCALE_CARD,
    };
  }
  // Solo sobrevive el fundido, y recortado a 100 ms.
  return {
    reducido: true,
    instant: 0,
    fast: 100,
    base: 100,
    slow: 100,
    screen: 0,
    data: 0,
    translateY: 0,
    step: 0,
    escalaBoton: 1,
    escalaTarjeta: 1,
  };
}

/** Compatibilidad con el código anterior. Usar layout.hitTarget. */
export const HIT_TARGET = layout.hitTarget;
