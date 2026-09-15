import { router } from 'expo-router';
import { Check, ChevronDown, House, Settings2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/lib/i18n';
import { Divider, IconTile, ListRow, Sheet, spacing, typography, useTheme } from '@/ui';
import { useCasaActiva } from './CasaActivaProvider';

/**
 * El selector de casa activa.
 *
 * Es el mismo control en todas las pantallas de Nexum, y cambia la casa
 * de TODA la app: no es un filtro local de la pantalla donde lo tocas.
 * Por eso vive junto al provider y no dentro de una pantalla concreta.
 *
 * El chevron se dibuja siempre, también con una sola casa: la hoja no
 * sirve solo para cambiar de casa, también es el camino a "Gestionar mis
 * casas". Un control que abre algo y no lo anuncia no se descubre.
 */
export function SelectorCasa() {
  const { colors } = useTheme();
  const { casas, activa, cambiar } = useCasaActiva();
  const [abierta, setAbierta] = useState(false);

  if (!activa) return null;

  return (
    <>
      <Pressable
        onPress={() => setAbierta(true)}
        accessibilityRole="button"
        accessibilityLabel={t('casas.selectorEtiqueta', { casa: activa.name })}
        hitSlop={8}
        style={styles.disparador}
      >
        <Text style={[typography.body, { color: colors.textSecondary }]}>{activa.name}</Text>
        <ChevronDown size={16} strokeWidth={1.75} color={colors.textSecondary} />
      </Pressable>

      <Sheet
        visible={abierta}
        titulo={t('casas.selectorTitulo')}
        cancelar={t('acciones.cerrar')}
        onCerrar={() => setAbierta(false)}
      >
        {casas.map((c) => (
          <ListRow
            key={c.id}
            titulo={c.name}
            subtitulo={t(`roles.${c.mi_rol}`)}
            izquierda={
              <IconTile tamano={44} fondo={colors.surfaceAccent}>
                <House size={18} strokeWidth={1.75} color={colors.brand} />
              </IconTile>
            }
            // La marca sustituye a la flecha: esta fila no te lleva a otro
            // sitio, te dice dónde estás.
            flecha={false}
            derecha={
              c.id === activa.id ? (
                <Check size={20} strokeWidth={2.2} color={colors.brand} />
              ) : undefined
            }
            onPress={() => {
              cambiar(c.id);
              setAbierta(false);
            }}
          />
        ))}

        <Divider />

        <ListRow
          titulo={t('casas.gestionar')}
          izquierda={
            <IconTile tamano={44} fondo={colors.surfaceSunken}>
              <Settings2 size={18} strokeWidth={1.75} color={colors.textSecondary} />
            </IconTile>
          }
          onPress={() => {
            setAbierta(false);
            router.push('/casas');
          }}
        />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  disparador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
});
