import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { useAuth } from '@/core/auth';
import {
  DURACIONES,
  crearCodigoDeCasa,
  estadoDeCodigo,
  listarCodigos,
  revocarCodigo,
} from '@/core/access';
import {
  borrarHabitacion,
  crearHabitaciones,
  expulsarMiembro,
  listarCasas,
  listarHabitaciones,
  listarMiembros,
  type CasaConRol,
  type MiembroConPerfil,
} from '@/core/homes';
import { fechaCorta, fechaLarga } from '@/lib/format';
import { t } from '@/lib/i18n';
import type { AccessCode, Room } from '@nexum/shared-types';
import {
  Badge,
  Button,
  Card,
  Divider,
  ListRow,
  Screen,
  TextField,
  colors,
  radius,
  spacing,
  typography,
} from '@/ui';

type Duracion = (typeof DURACIONES)[number];

export default function DetalleCasaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { session } = useAuth();

  const [casa, setCasa] = useState<CasaConRol | null>(null);
  const [habitaciones, setHabitaciones] = useState<Room[]>([]);
  const [miembros, setMiembros] = useState<MiembroConPerfil[]>([]);
  const [codigos, setCodigos] = useState<AccessCode[]>([]);
  const [cargando, setCargando] = useState(true);

  const [nuevaHabitacion, setNuevaHabitacion] = useState('');
  const [creandoCodigo, setCreandoCodigo] = useState(false);
  const [duracion, setDuracion] = useState<Duracion>(DURACIONES[1]);
  const [rolCodigo, setRolCodigo] = useState<'member' | 'guest'>('guest');
  const [codigoNuevo, setCodigoNuevo] = useState<{ code: string; expires_at: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  const esAdmin = casa?.mi_rol === 'owner' || casa?.mi_rol === 'admin';

  const cargar = useCallback(() => {
    if (!id) return;
    setCargando(true);
    Promise.all([listarCasas(), listarHabitaciones(id), listarMiembros(id)])
      .then(async ([casas, habs, miem]) => {
        const actual = casas.find((c) => c.id === id) ?? null;
        setCasa(actual);
        setHabitaciones(habs);
        setMiembros(miem);
        navigation.setOptions({ title: actual?.name ?? '' });

        // Los códigos solo los puede leer un admin: si no lo es, ni se piden.
        if (actual?.mi_rol === 'owner' || actual?.mi_rol === 'admin') {
          setCodigos(await listarCodigos(id).catch(() => []));
        } else {
          setCodigos([]);
        }
      })
      .finally(() => setCargando(false));
  }, [id, navigation]);

  useFocusEffect(cargar);

  async function anadirHabitacion() {
    const n = nuevaHabitacion.trim();
    if (!n || !id) return;
    setNuevaHabitacion('');
    await crearHabitaciones(id, [n]);
    cargar();
  }

  function confirmarBorrarHabitacion(h: Room) {
    Alert.alert(h.name, '¿Quieres borrar esta habitación?', [
      { text: t('acciones.cancelar'), style: 'cancel' },
      {
        text: t('acciones.borrar'),
        style: 'destructive',
        onPress: async () => {
          await borrarHabitacion(h.id);
          cargar();
        },
      },
    ]);
  }

  async function generarCodigo() {
    if (!id) return;
    const r = await crearCodigoDeCasa(id, rolCodigo, duracion.horas);
    if (r.ok) {
      setCodigoNuevo({ code: r.datos.code, expires_at: r.datos.expires_at });
      setCreandoCodigo(false);
      setCopiado(false);
      cargar();
    } else {
      Alert.alert(t('errores.generico'), t(`errores.${r.motivo}`));
    }
  }

  async function copiar(texto: string) {
    await Clipboard.setStringAsync(texto);
    setCopiado(true);
  }

  function confirmarRevocar(c: AccessCode) {
    Alert.alert(c.code, t('codigos.revocarAviso'), [
      { text: t('acciones.cancelar'), style: 'cancel' },
      {
        text: t('codigos.revocar'),
        style: 'destructive',
        onPress: async () => {
          await revocarCodigo(c.id);
          cargar();
        },
      },
    ]);
  }

  function confirmarExpulsar(m: MiembroConPerfil) {
    const esYo = m.user_id === session?.user.id;
    Alert.alert(
      m.profiles?.display_name ?? t('miembros.tu'),
      esYo ? t('casas.salirDeCasa') : t('miembros.expulsar'),
      [
        { text: t('acciones.cancelar'), style: 'cancel' },
        {
          text: esYo ? t('casas.salirDeCasa') : t('miembros.expulsar'),
          style: 'destructive',
          onPress: async () => {
            await expulsarMiembro(m.home_id, m.user_id);
            if (esYo) router.replace('/casas');
            else cargar();
          },
        },
      ],
    );
  }

  if (cargando && !casa) {
    return (
      <Screen>
        <ActivityIndicator color={colors.brand} />
      </Screen>
    );
  }

  return (
    <Screen title={casa?.name}>
      {/* ─── Habitaciones ─────────────────────────────────────────── */}
      <Text style={styles.seccion}>{t('casas.habitaciones')}</Text>
      <Card>
        {habitaciones.length === 0 ? (
          <Text style={styles.vacio}>{t('casas.habitacionesVacias')}</Text>
        ) : (
          habitaciones.map((h, i) => (
            <View key={h.id}>
              {i > 0 && <Divider />}
              <ListRow
                titulo={h.name}
                onPress={esAdmin ? () => confirmarBorrarHabitacion(h) : undefined}
                derecha={esAdmin ? <Text style={styles.quitar}>×</Text> : undefined}
              />
            </View>
          ))
        )}

        {esAdmin && (
          <View style={styles.anadir}>
            <TextField
              label={t('acciones.anadir')}
              placeholder={t('onboarding.habitacionNueva')}
              value={nuevaHabitacion}
              onChangeText={setNuevaHabitacion}
              onSubmitEditing={anadirHabitacion}
              returnKeyType="done"
            />
          </View>
        )}
      </Card>

      {/* ─── Miembros ─────────────────────────────────────────────── */}
      <Text style={styles.seccion}>{t('casas.miembros')}</Text>
      <Card>
        {miembros.map((m, i) => {
          const esYo = m.user_id === session?.user.id;
          return (
            <View key={m.user_id}>
              {i > 0 && <Divider />}
              <ListRow
                titulo={
                  (m.profiles?.display_name ?? '—') + (esYo ? ` · ${t('miembros.tu')}` : '')
                }
                subtitulo={
                  m.expires_at
                    ? t('miembros.caduca', { fecha: fechaCorta(m.expires_at) })
                    : t('miembros.permanente')
                }
                onPress={esAdmin || esYo ? () => confirmarExpulsar(m) : undefined}
                derecha={<Badge texto={t(`roles.${m.role}`)} />}
              />
            </View>
          );
        })}
      </Card>

      {/* ─── Códigos de invitado ──────────────────────────────────── */}
      {esAdmin ? (
        <>
          <Text style={styles.seccion}>{t('casas.codigos')}</Text>

          {codigoNuevo ? (
            <Card>
              <Text style={styles.codigoTitulo}>{t('codigos.creado')}</Text>
              <View style={styles.qrCaja}>
                <QRCode value={codigoNuevo.code} size={180} backgroundColor="#FFFFFF" />
              </View>
              <Text style={styles.codigoTexto} selectable>
                {codigoNuevo.code}
              </Text>
              <Text style={styles.codigoPie}>
                {t('codigos.caducaEl', { fecha: fechaLarga(codigoNuevo.expires_at) })}
              </Text>
              <Button
                label={copiado ? t('acciones.copiado') : t('acciones.copiar')}
                variante="secundario"
                onPress={() => copiar(codigoNuevo.code)}
              />
              <Button
                label={t('acciones.cerrar')}
                variante="texto"
                onPress={() => setCodigoNuevo(null)}
              />
            </Card>
          ) : null}

          {creandoCodigo ? (
            <Card>
              <Text style={styles.etiqueta}>{t('codigos.duracion')}</Text>
              <View style={styles.opciones}>
                {DURACIONES.map((d) => (
                  <Opcion
                    key={d.etiqueta}
                    texto={d.etiqueta}
                    activa={d.horas === duracion.horas}
                    onPress={() => setDuracion(d)}
                  />
                ))}
              </View>

              <Text style={styles.etiqueta}>{t('codigos.queRol')}</Text>
              <View style={styles.opciones}>
                <Opcion
                  texto={t('roles.member')}
                  activa={rolCodigo === 'member'}
                  onPress={() => setRolCodigo('member')}
                />
                <Opcion
                  texto={t('roles.guest')}
                  activa={rolCodigo === 'guest'}
                  onPress={() => setRolCodigo('guest')}
                />
              </View>
              <Text style={styles.ayuda}>
                {rolCodigo === 'member' ? t('codigos.rolMember') : t('codigos.rolGuest')}
              </Text>

              <Button label={t('codigos.crear')} onPress={generarCodigo} />
              <Button
                label={t('acciones.cancelar')}
                variante="texto"
                onPress={() => setCreandoCodigo(false)}
              />
            </Card>
          ) : (
            <Button
              label={t('codigos.crear')}
              variante="secundario"
              onPress={() => setCreandoCodigo(true)}
            />
          )}

          <Card>
            {codigos.length === 0 ? (
              <Text style={styles.vacio}>{t('codigos.vacioTexto')}</Text>
            ) : (
              codigos.map((c, i) => {
                const estado = estadoDeCodigo(c);
                return (
                  <View key={c.id}>
                    {i > 0 && <Divider />}
                    <ListRow
                      titulo={c.code}
                      subtitulo={`${t(`roles.${c.role}`)} · ${t('codigos.caducaEl', {
                        fecha: fechaCorta(c.expires_at),
                      })}`}
                      onPress={estado === 'activo' ? () => confirmarRevocar(c) : undefined}
                      derecha={
                        <Badge
                          texto={t(`codigos.estado.${estado}`)}
                          tono={estado === 'activo' ? 'ok' : estado === 'caducado' ? 'aviso' : 'error'}
                        />
                      }
                    />
                  </View>
                );
              })
            )}
          </Card>
        </>
      ) : (
        <Card>
          <Text style={styles.vacio}>{t('miembros.soloAdmin')}</Text>
        </Card>
      )}
    </Screen>
  );
}

function Opcion({
  texto,
  activa,
  onPress,
}: {
  texto: string;
  activa: boolean;
  onPress: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: activa }}
      style={[styles.opcion, activa && styles.opcionActiva]}
    >
      {texto}
    </Text>
  );
}

const styles = StyleSheet.create({
  seccion: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase', paddingTop: spacing.md },
  vacio: { ...typography.caption, color: colors.textFaint },
  quitar: { ...typography.title, color: colors.textFaint },
  anadir: { paddingTop: spacing.sm },
  etiqueta: { ...typography.bodyStrong, color: colors.text, paddingTop: spacing.sm },
  ayuda: { ...typography.caption, color: colors.textMuted },
  opciones: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  opcion: {
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  opcionActiva: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
    color: colors.textOnBrand,
    fontWeight: '600',
  },
  codigoTitulo: { ...typography.heading, color: colors.text, textAlign: 'center' },
  qrCaja: {
    alignSelf: 'center',
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
  },
  codigoTexto: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 2,
  },
  codigoPie: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});
