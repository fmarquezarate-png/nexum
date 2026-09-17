import { router, useFocusEffect } from 'expo-router';
import { Lightbulb, Plus, ShieldCheck, Sparkles, Zap } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/core/auth';
import { SelectorCasa, useCasaActiva } from '@/core/homes';
import { MODULOS } from '@/modules/registry';
import type { ModuleManifest, ResumenModulo } from '@/modules/tipos';
import { mensajeDe } from '@/lib/errores';
import { t } from '@/lib/i18n';
import {
  Badge,
  BotonTema,
  Card,
  EmptyState,
  Entrada,
  ErrorState,
  EsqueletoTarjetas,
  IconTile,
  Screen,
  layout,
  radius,
  spacing,
  themeForModule,
  typography,
  useTheme,
} from '@/ui';

const LOGO = require('../../assets/marcas/nexum-completo.png');

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'listo'; resumenes: { m: ModuleManifest; r: ResumenModulo }[] }
  | { tipo: 'error'; motivo: string };

/**
 * Portada de Nexum. La pantalla que explica el producto entero.
 *
 * REGLA DE ORO DE ESTA PANTALLA: Nexum MIRA, la sub-app HACE.
 * Aquí no hay ni un solo control que cambie el estado de un aparato. Se
 * muestra el resumen de cada app y, al tocarlo, se entra en su mundo.
 *
 * Lo que Nexum sabe de cada módulo se lo da su manifiesto, y el
 * manifiesto no expone la mascota. Por eso Airi no puede volver a
 * aparecer aquí ni por accidente.
 */
export default function InicioScreen() {
  const { perfil } = useAuth();
  const { colors } = useTheme();
  // La casa activa la manda el provider, no esta pantalla: cambiarla en
  // la hoja tiene que notarse en Dispositivos y en Estadísticas también.
  const { activa, cargando: cargandoCasas, error: errorCasas, recargar } = useCasaActiva();
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });

  const cargar = useCallback(() => {
    if (cargandoCasas) return;
    if (!activa) return setEstado({ tipo: 'listo', resumenes: [] });

    // Cada módulo decide si tiene algo que contar. Si devuelve null,
    // Nexum no dibuja NADA suyo: ni tarjeta, ni color, ni mascota.
    Promise.all(
      MODULOS.map(async (m) => {
        const r = await m.resumenDeHogar(activa.id).catch(() => null);
        return r ? { m, r } : null;
      }),
    )
      .then((todos) =>
        setEstado({
          tipo: 'listo',
          resumenes: todos.filter((x): x is { m: ModuleManifest; r: ResumenModulo } => x !== null),
        }),
      )
      .catch((fallo) => setEstado({ tipo: 'error', motivo: mensajeDe(fallo) }));
  }, [activa, cargandoCasas]);

  useFocusEffect(cargar);

  const nombre = perfil?.display_name?.split(' ')[0];
  const cargando = cargandoCasas || estado.tipo === 'cargando';
  // El fallo de las casas manda sobre el de los módulos: sin casa activa
  // no hay contexto en el que un resumen signifique nada.
  const motivoError = errorCasas ?? (estado.tipo === 'error' ? estado.motivo : null);

  return (
    <Screen>
      {/* ── 0 · Cabecera ─────────────────────────────────────────── */}
      <View style={styles.cabecera}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <View style={styles.acciones}>
          <BotonTema />
          <Pressable
            onPress={() => router.push('/perfil')}
            accessibilityRole="button"
            accessibilityLabel="Perfil"
            style={[styles.avatar, { backgroundColor: colors.surfaceAccent }]}
          >
            <Text style={[typography.bodyStrong, { color: colors.brand }]}>
              {(nombre ?? '?').charAt(0).toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── 1 · Saludo y casa activa ─────────────────────────────── */}
      <View style={styles.saludo}>
        <Text style={[typography.display, { color: colors.text }]}>
          {nombre ? t('inicio.saludo', { name: nombre }) : t('inicio.sinNombre')}
        </Text>

        <SelectorCasa />
      </View>

      {/* Esqueleto y no ruedecita: se enseña la forma de las tarjetas que
          van a llegar, así nada salta de sitio cuando llegan. */}
      {cargando ? <EsqueletoTarjetas cuantas={2} /> : null}

      {!cargando && motivoError ? (
        <ErrorState
          titulo={t('errores.cargar')}
          detalle={t('errores.cargarDetalle')}
          tecnico={motivoError}
          onReintentar={() => {
            recargar();
            cargar();
          }}
        />
      ) : null}

      {!cargando && !motivoError && estado.tipo === 'listo' ? (
        <>
          {/* ── 3 · Mis dispositivos ─────────────────────────────── */}
          {estado.resumenes.length > 0 ? (
            <>
              <Seccion titulo={t('inicio.misDispositivos')} />
              {estado.resumenes.map(({ m, r }, i) => (
                <Entrada key={m.id} indice={i}>
                  <TarjetaModulo modulo={m} resumen={r} />
                </Entrada>
              ))}
            </>
          ) : (
            <EmptyState
              quien="nexi"
              titulo={t('inicio.sinDispositivosTitulo')}
              descripcion={t('inicio.sinDispositivosTexto')}
              accion={{
                label: t('dispositivos.anadir'),
                onPress: () => router.push('/anadir-dispositivo'),
              }}
            />
          )}

          {/* ── 5 · Apps integradas. SIEMPRE se dibuja ───────────── */}
          <Seccion
            titulo={t('inicio.appsIntegradas')}
            accion={{ onPress: () => router.push('/anadir-dispositivo') }}
          />
          <View style={styles.rejilla}>
            {MODULOS.map((m, i) => (
              // El escalonado no se reinicia por sección: las apps siguen
              // contando desde donde lo dejaron los resúmenes de arriba.
              <Entrada key={m.id} indice={estado.resumenes.length + i} style={styles.mitad}>
                <TarjetaApp modulo={m} />
              </Entrada>
            ))}
          </View>

          {/* ── 6 · Y más por venir ──────────────────────────────── */}
          <Seccion titulo={t('inicio.masPorVenir')} />
          <View style={styles.rejilla}>
            <TarjetaFutura id="iluminacion" Icono={Lightbulb} />
            <TarjetaFutura id="seguridad" Icono={ShieldCheck} />
            <TarjetaFutura id="energia" Icono={Zap} />
            <TarjetaFutura id="ideas" Icono={Sparkles} pulsable={false} />
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function Seccion({ titulo, accion }: { titulo: string; accion?: { onPress: () => void } }) {
  const { colors } = useTheme();
  return (
    <View style={styles.seccion}>
      <Text style={[typography.section, { color: colors.text }]}>{titulo}</Text>
      {accion ? (
        <Pressable
          onPress={accion.onPress}
          accessibilityRole="button"
          accessibilityLabel={t('dispositivos.anadir')}
          hitSlop={8}
          style={[styles.mas, { backgroundColor: colors.surfaceAccent }]}
        >
          <Plus size={18} strokeWidth={2.2} color={colors.brand} />
        </Pressable>
      ) : null}
    </View>
  );
}

/** Tarjeta de un módulo CON dispositivos. Resumen, nunca control. */
function TarjetaModulo({ modulo, resumen }: { modulo: ModuleManifest; resumen: ResumenModulo }) {
  const { colors, scheme } = useTheme();
  const acento = themeForModule(modulo.id, scheme);

  // El estado manda sobre el acento: un aviso se ve amarillo aunque el
  // módulo sea cyan. El color del módulo es identidad; el del estado,
  // información, y la información gana.
  const colorEstado =
    resumen.estado === 'aviso'
      ? colors.warning
      : resumen.estado === 'sinSenal'
        ? colors.offline
        : resumen.estado === 'apagado'
          ? colors.textFaint
          : acento.primary;

  return (
    <Card onPress={() => router.push(modulo.ruta)}>
      <View style={styles.filaModulo}>
        <IconTile fondo={acento.soft}>
          <Image source={modulo.logo} style={styles.logoModulo} resizeMode="contain" />
        </IconTile>
        <View style={styles.flexible}>
          <Text style={[typography.cardTitle, { color: colors.text }]}>{modulo.nombre}</Text>
          <View style={styles.estado}>
            <View style={[styles.punto, { backgroundColor: colorEstado }]} />
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {resumen.textoEstado}
            </Text>
          </View>
        </View>
      </View>

      {resumen.lineas.slice(0, 3).map((linea) => (
        <Text key={linea} style={[typography.caption, { color: colors.textSecondary }]}>
          {linea}
        </Text>
      ))}
    </Card>
  );
}

/** Tarjeta del catálogo. Se dibuja tengas o no aparatos de ese módulo. */
function TarjetaApp({ modulo }: { modulo: ModuleManifest }) {
  const { colors, scheme } = useTheme();
  const acento = themeForModule(modulo.id, scheme);
  const proximo = modulo.estado === 'proximamente';

  return (
    <Card compacta onPress={() => router.push(proximo ? `/modulo/${modulo.id}` : modulo.ruta)}>
      <IconTile tamano={56} fondo={acento.soft}>
        <Image source={modulo.logo} style={styles.logoApp} resizeMode="contain" />
      </IconTile>
      <Text style={[typography.cardTitle, { color: colors.text }]}>{modulo.nombre}</Text>
      <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={2}>
        {modulo.tagline}
      </Text>
      {proximo ? <Badge texto={t('inicio.pronto')} /> : null}
    </Card>
  );
}

/**
 * Idea sin módulo detrás. Pesa visualmente menos que todo lo de arriba:
 * fondo hundido, sin sombra y más baja. Son ideas, no productos.
 */
function TarjetaFutura({
  id,
  Icono,
  pulsable = true,
}: {
  id: string;
  Icono: typeof Lightbulb;
  pulsable?: boolean;
}) {
  const { colors } = useTheme();

  const contenido = (
    <View style={[styles.futura, { backgroundColor: colors.surfaceSunken }]}>
      <IconTile tamano={32} fondo={colors.surface}>
        <Icono size={16} strokeWidth={1.75} color={colors.textMuted} />
      </IconTile>
      <View style={styles.flexible}>
        <Text style={[typography.captionStrong, { color: colors.text }]}>
          {t(`futuro.${id}.nombre`)}
        </Text>
        <Text style={[typography.caption, { color: colors.textFaint }]} numberOfLines={2}>
          {t(`futuro.${id}.linea`)}
        </Text>
      </View>
    </View>
  );

  if (!pulsable) return <View style={styles.mitad}>{contenido}</View>;

  return (
    <Pressable
      style={styles.mitad}
      onPress={() => router.push(`/modulo/${id}`)}
      accessibilityRole="button"
    >
      {contenido}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { width: 110, height: 28 },
  acciones: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: layout.avatar,
    height: layout.avatar,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saludo: { gap: spacing.xxs, paddingTop: spacing.sm },
  seccion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: layout.sectionGap - layout.cardGap,
  },
  mas: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaModulo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoModulo: { width: 28, height: 28, borderRadius: 8 },
  logoApp: { width: 36, height: 36, borderRadius: 10 },
  flexible: { flex: 1, gap: spacing.xxs },
  estado: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  punto: { width: 7, height: 7, borderRadius: 4 },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.cardGap },
  mitad: { width: '47.5%', flexGrow: 1 },
  futura: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
});
