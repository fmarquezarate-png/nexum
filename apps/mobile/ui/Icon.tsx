import type { LucideIcon } from 'lucide-react-native';

import { useTheme } from './ThemeProvider';

/**
 * Contextos en los que aparece un icono, con su tamaño y su grosor.
 *
 * El grosor BAJA cuando el icono crece y SUBE cuando encoge. Así el peso
 * óptico se ve constante: un icono de 40 px trazado a 2 px se ve gordo
 * al lado de un texto, y uno de 14 px trazado a 1.5 px desaparece.
 */
const CONTEXTOS = {
  /** Junto a un texto pequeño. */
  enLinea: { size: 14, strokeWidth: 2 },
  /** Icono de fila y chevron. */
  fila: { size: 20, strokeWidth: 1.75 },
  /** Dentro de un azulejo de 44 pt. */
  azulejo: { size: 22, strokeWidth: 1.75 },
  /** Dentro de un azulejo pequeño de 32 pt. */
  azulejoPequeno: { size: 16, strokeWidth: 1.75 },
  /** Barra de pestañas. */
  pestana: { size: 24, strokeWidth: 1.75 },
  /** Pestaña activa: mismo tamaño, algo más de cuerpo. */
  pestanaActiva: { size: 24, strokeWidth: 2 },
  /** Icono grande de un estado vacío o de error. */
  estado: { size: 40, strokeWidth: 1.5 },
} as const;

export type ContextoIcono = keyof typeof CONTEXTOS;

/** Tonos permitidos. Nunca `text` a pelo: un icono negro pesa más que el texto que acompaña. */
export type TonoIcono = 'secundario' | 'marca' | 'apagado' | 'peligro' | 'aviso' | 'exito' | 'sobreRelleno';

interface IconProps {
  /** El icono de Lucide, tal cual se importa. */
  de: LucideIcon;
  contexto?: ContextoIcono;
  tono?: TonoIcono;
  /** Color de módulo: solo dentro de su azulejo. */
  color?: string;
}

/**
 * Todo icono de la app pasa por aquí.
 *
 * Existe para que el tamaño y el grosor no se decidan pantalla a
 * pantalla: en cuanto dos iconos vecinos llevan grosores distintos, la
 * pantalla deja de parecer de una sola mano.
 */
export function Icon({ de: Pieza, contexto = 'fila', tono = 'secundario', color }: IconProps) {
  const { colors } = useTheme();

  const tonos: Record<TonoIcono, string> = {
    secundario: colors.textSecondary,
    marca: colors.brand,
    apagado: colors.textFaint,
    peligro: colors.danger,
    aviso: colors.warning,
    exito: colors.success,
    sobreRelleno: colors.textOnFill,
  };

  const { size, strokeWidth } = CONTEXTOS[contexto];
  return <Pieza size={size} strokeWidth={strokeWidth} color={color ?? tonos[tono]} />;
}
