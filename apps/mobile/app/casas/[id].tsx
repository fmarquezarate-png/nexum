import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { Copy, DoorOpen, KeyRound, Pencil, Plus, Trash2, UserRound, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {
  DURACIONES,
  crearCodigoDeCasa,
  estadoDeCodigo,
  listarCodigos,
  revocarCodigo,
} from '@/core/access';
import { useAuth } from '@/core/auth';
import {
  borrarCasa,
  borrarHabitacion,
  contarDispositivos,
  crearHabitaciones,
  expulsarMiembro,
  listarCasas,
  listarHabitaciones,
  listarMiembros,
  renombrarCasa,
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
  ConfirmSheet,
  Divider,
  ErrorState,
  IconTile,
  ListRow,
  Loading,
  PressableAnimado,
  Screen,
  SegmentedControl,
  TextField,
  layout,
  radius,
  spacing,
  typography,
  useAviso,
  usePressScale,
  useTheme,
} from '@/ui';

/** Lo que hay que confirmar en cada momento. null = nada abierto. */
type Confirmacion =
  | { que: 'borrarCasa' }
  | { que: 'salirCasa' }
  | { que: 'borrarHabitacion'; habitacion: Room }
  | { que: 'expulsar'; miembro: MiembroConPerfil }
  | { que: 'revocar'; codigo: AccessCode }
  | null;

interface Datos {
  casa: CasaConRol;
  habitaciones: Room[];
  miembros: MiembroConPerfil[];
  codigos: AccessCode[];
  dispositivos: number;
}

type Estado = { tipo: 'cargando' } | { tipo: 'listo'; datos: Datos } | { tipo: 'error' };

export default function DetalleCasaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { session } = useAuth();
  const { colors } = useTheme();
  const { avisarExito, avisarAviso } = useAviso();

  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const [confirmando, setConfirmando] = useState<Confirmacion>(null);
  const [nuevaHabitacion, setNuevaHabitacion] = useState('');
  const [renombrando, setRenombrando] = useState(false);
  const [nombreNuevo, setNombreNuevo] = useState('');
  const [creandoCodigo, setCreandoCodigo] = useState(false);
  const [horas, setHoras] = useState<number>(DURACIONES[1].horas);
  const [rolCodigo, setRolCodigo] = useState<'member' | 'guest'>('guest');
  const [codigoNuevo, setCodigoNuevo] = useState<{ code: string; expires_at: string } | null>(null);
  const [copiado, setCopiado] = useState(false);

  const cargar = useCallback(() => {
    if (!id) return;
    Promise.all([listarCasas(), listarHabitaciones(id), listarMiembros(id)])
      .then(async ([casas, habitaciones, miembros]) => {
        const casa = casas.find((c) => c.id === id);
        if (!casa) {
          // Te han quitado el acceso, o acabas de salirte.
          router.replace('/casas');
          return;
        }
        navigation.setOptions({ title: casa.name });

        const esAdmin = casa.mi_rol === 'owner' || casa.mi_rol === 'admin';
        const [codigos, dispositivos] = await Promise.all([
          esAdmin ? listarCodigos(id).catch(() => []) : Promise.resolve([]),
          contarDispositivos(id).catch(() => 0),
        ]);

        setEstado({ tipo: 'listo', datos: { casa, habitaciones, miembros, codigos, dispositivos } });
      })
      .catch(() => setEstado({ tipo: 'error' }));
  }, [id, navigation]);

  useFocusEffect(cargar);

  if (estado.tipo === 'cargando') return <Screen><Loading /></Screen>;
  if (estado.tipo === 'error') {
    return (
      <Screen>
        <ErrorState
          titulo={t('errores.cargar')}
          detalle={t('errores.cargarDetalle')}
          onReintentar={cargar}
        />
      </Screen>
    );
  }

  const { casa, habitaciones, miembros, codigos, dispositivos } = estado.datos;
  const esAdmin = casa.mi_rol === 'owner' || casa.mi_rol === 'admin';
  const esOwner = casa.mi_rol === 'owner';

  // ─── Acciones ──────────────────────────────────────────────────────

  async function anadirHabitacion() {
    const n = nuevaHabitacion.trim();
    if (!n || !id) return;
    setNuevaHabitacion('');
    try {
      await crearHabitaciones(id, [n]);
      avisarExito(t('casas.habitacionAnadida'));
      cargar();
    } catch {
      avisarAviso(t('errores.generico'));
    }
  }

  async function guardarNombre() {
    const n = nombreNuevo.trim();
    if (!n || !id) return;
    try {
      await renombrarCasa(id, n);
      setRenombrando(false);
      avisarExito(t('casas.renombrada'));
      cargar();
    } catch {
      avisarAviso(t('errores.generico'));
    }
  }

  async function generarCodigo() {
    if (!id) return;
    const r = await crearCodigoDeCasa(id, rolCodigo, horas);
    if (r.ok) {
      setCodigoNuevo({ code: r.datos.code, expires_at: r.datos.expires_at });
      setCreandoCodigo(false);
      setCopiado(false);
      cargar();
    } else {
      avisarAviso(t(`errores.${r.motivo}`));
    }
  }

  async function ejecutarConfirmacion() {
    const c = confirmando;
    setConfirmando(null);
    if (!c || !id) return;

    try {
      if (c.que === 'borrarCasa') {
        await borrarCasa(id);
        avisarExito(t('casas.borrada'));
        router.replace('/casas');
        return;
      }
      if (c.que === 'salirCasa') {
        await expulsarMiembro(id, session!.user.id);
        avisarExito(t('casas.salida'));
        router.replace('/casas');
        return;
      }
      if (c.que === 'borrarHabitacion') {
        await borrarHabitacion(c.habitacion.id);
        avisarExito(t('casas.habitacionBorrada'));
      }
      if (c.que === 'expulsar') {
        await expulsarMiembro(id, c.miembro.user_id);
        avisarExito(
          t('miembros.expulsado', { nombre: c.miembro.profiles?.display_name ?? '' }),
        );
      }
      if (c.que === 'revocar') {
        await revocarCodigo(c.codigo.id);
        avisarExito(t('codigos.revocado'));
      }
      cargar();
    } catch {
      avisarAviso(t('errores.generico'));
    }
  }

  // ─── Textos de la confirmación abierta ─────────────────────────────

  const dialogo = (() => {
    const c = confirmando;
    if (!c) return null;

    if (c.que === 'borrarCasa') {
      const consecuencias = [
        `${habitaciones.length} ${habitaciones.length === 1 ? 'habitación' : 'habitaciones'}`,
        `${dispositivos} ${dispositivos === 1 ? 'dispositivo' : 'dispositivos'} y todo su historial`,
      ];
      const otros = miembros.filter((m) => m.user_id !== session?.user.id);
      if (otros.length) {
        const nombres = otros.map((m) => m.profiles?.display_name ?? '—').join(', ');
        consecuencias.push(`${nombres} ${otros.length === 1 ? 'perderá' : 'perderán'} el acceso`);
      }
      return {
        titulo: t('casas.borrarTitulo', { casa: casa.name }),
        descripcion: t('casas.borrarTexto'),
        consecuencias,
        confirmar: t('casas.borrarConfirmar'),
        segundaPregunta: t('casas.borrarSegunda'),
      };
    }
    if (c.que === 'salirCasa') {
      return {
        titulo: t('casas.salirTitulo', { casa: casa.name }),
        descripcion: t('casas.salirTexto'),
        confirmar: t('casas.salirConfirmar'),
      };
    }
    if (c.que === 'borrarHabitacion') {
      return {
        titulo: t('habitaciones.borrarTitulo', { nombre: c.habitacion.name }),
        descripcion: t('habitaciones.borrarTexto'),
        confirmar: t('habitaciones.borrarConfirmar'),
      };
    }
    if (c.que === 'expulsar') {
      const nombre = c.miembro.profiles?.display_name ?? '';
      return {
        titulo: t('miembros.expulsarTitulo', { nombre }),
        descripcion: t('miembros.expulsarTexto'),
        confirmar: t('miembros.expulsarConfirmar'),
      };
    }
    return {
      titulo: c.codigo.code,
      descripcion: t('codigos.revocarAviso'),
      confirmar: t('codigos.revocar'),
    };
  })();

  return (
    <Screen title={casa.name} subtitle={t(`roles.${casa.mi_rol}`)}>
      {/* ─── Habitaciones ─────────────────────────────────────────── */}
      <Seccion titulo={t('casas.habitaciones')} />
      <Card>
        {habitaciones.length === 0 ? (
          <Text style={[typography.caption, { color: colors.textFaint }]}>
            {t('casas.habitacionesVacias')}
          </Text>
        ) : (
          habitaciones.map((h, i) => (
            <View key={h.id}>
              {i > 0 && <Divider />}
              <ListRow
                titulo={h.name}
                flecha={false}
                derecha={
                  esAdmin ? (
                    <BotonIcono
                      etiqueta={t('habitaciones.borrarConfirmar')}
                      onPress={() => setConfirmando({ que: 'borrarHabitacion', habitacion: h })}
                    >
                      <Trash2 size={17} strokeWidth={1.75} color={colors.textFaint} />
                    </BotonIcono>
                  ) : undefined
                }
              />
            </View>
          ))
        )}

        {esAdmin ? (
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
        ) : null}
      </Card>

      {/* ─── Miembros ─────────────────────────────────────────────── */}
      <Seccion titulo={t('casas.miembros')} />
      <Card>
        {miembros.map((m, i) => {
          const esYo = m.user_id === session?.user.id;
          return (
            <View key={m.user_id}>
              {i > 0 && <Divider />}
              <ListRow
                titulo={(m.profiles?.display_name ?? '—') + (esYo ? ` · ${t('miembros.tu')}` : '')}
                subtitulo={
                  m.expires_at
                    ? t('miembros.caduca', { fecha: fechaCorta(m.expires_at) })
                    : t('miembros.permanente')
                }
                flecha={false}
                izquierda={
                  <IconTile tamano={32}>
                    <UserRound size={16} strokeWidth={1.75} color={colors.brand} />
                  </IconTile>
                }
                derecha={
                  <View style={styles.derecha}>
                    <Badge texto={t(`roles.${m.role}`)} />
                    {esAdmin && !esYo ? (
                      <BotonIcono
                        etiqueta={t('miembros.expulsar')}
                        onPress={() => setConfirmando({ que: 'expulsar', miembro: m })}
                      >
                        <X size={17} strokeWidth={2} color={colors.textFaint} />
                      </BotonIcono>
                    ) : null}
                  </View>
                }
              />
            </View>
          );
        })}
      </Card>

      {/* ─── Códigos de invitado ──────────────────────────────────── */}
      {esAdmin ? (
        <>
          <Seccion titulo={t('casas.codigos')} />

          {codigoNuevo ? (
            <Card elevada>
              <Text style={[typography.section, { color: colors.text }, styles.centro]}>
                {t('codigos.creado')}
              </Text>
              <View style={styles.qr}>
                <QRCode value={codigoNuevo.code} size={172} backgroundColor="#FFFFFF" />
              </View>
              <Text style={[typography.dataM, { color: colors.text }, styles.codigo]} selectable>
                {codigoNuevo.code}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }, styles.centro]}>
                {t('codigos.caducaEl', { fecha: fechaLarga(codigoNuevo.expires_at) })}
              </Text>
              <Button
                label={copiado ? t('acciones.copiado') : t('acciones.copiar')}
                variante="secundario"
                icono={<Copy size={17} strokeWidth={1.75} color={colors.text} />}
                onPress={async () => {
                  await Clipboard.setStringAsync(codigoNuevo.code);
                  setCopiado(true);
                  avisarExito(t('acciones.copiado'));
                }}
              />
              <Button
                label={t('acciones.hecho')}
                variante="texto"
                onPress={() => setCodigoNuevo(null)}
              />
            </Card>
          ) : null}

          {creandoCodigo ? (
            <Card>
              <Text style={[typography.bodyStrong, { color: colors.text }]}>
                {t('codigos.duracion')}
              </Text>
              <SegmentedControl
                opciones={DURACIONES.map((d) => ({ valor: String(d.horas), label: d.etiqueta }))}
                valor={String(horas)}
                onChange={(v) => setHoras(Number(v))}
              />

              <Text style={[typography.bodyStrong, { color: colors.text }, styles.separado]}>
                {t('codigos.queRol')}
              </Text>
              <SegmentedControl
                opciones={[
                  { valor: 'guest', label: t('roles.guest') },
                  { valor: 'member', label: t('roles.member') },
                ]}
                valor={rolCodigo}
                onChange={(v) => setRolCodigo(v as 'member' | 'guest')}
              />
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {rolCodigo === 'member' ? t('codigos.rolMember') : t('codigos.rolGuest')}
              </Text>

              <View style={styles.acciones}>
                <Button label={t('codigos.crear')} onPress={generarCodigo} vibra />
                <Button
                  label={t('acciones.cancelar')}
                  variante="texto"
                  onPress={() => setCreandoCodigo(false)}
                />
              </View>
            </Card>
          ) : (
            <Button
              label={t('codigos.crear')}
              variante="secundario"
              icono={<Plus size={18} strokeWidth={2} color={colors.text} />}
              onPress={() => setCreandoCodigo(true)}
            />
          )}

          {codigos.length > 0 ? (
            <Card>
              {codigos.map((c, i) => {
                const est = estadoDeCodigo(c);
                return (
                  <View key={c.id}>
                    {i > 0 && <Divider />}
                    <ListRow
                      titulo={c.code}
                      subtitulo={`${t(`roles.${c.role}`)} · ${t('codigos.caducaEl', {
                        fecha: fechaCorta(c.expires_at),
                      })}`}
                      flecha={false}
                      izquierda={
                        <IconTile tamano={32}>
                          <KeyRound size={16} strokeWidth={1.75} color={colors.brand} />
                        </IconTile>
                      }
                      derecha={
                        <View style={styles.derecha}>
                          <Badge
                            texto={t(`codigos.estado.${est}`)}
                            tono={est === 'activo' ? 'ok' : est === 'caducado' ? 'aviso' : 'error'}
                          />
                          {est === 'activo' ? (
                            <BotonIcono
                              etiqueta={t('codigos.revocar')}
                              onPress={() => setConfirmando({ que: 'revocar', codigo: c })}
                            >
                              <X size={17} strokeWidth={2} color={colors.textFaint} />
                            </BotonIcono>
                          ) : null}
                        </View>
                      }
                    />
                  </View>
                );
              })}
            </Card>
          ) : null}
        </>
      ) : (
        <Card>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {t('miembros.soloAdmin')}
          </Text>
        </Card>
      )}

      {/* ─── Zona delicada ────────────────────────────────────────── */}
      <Seccion titulo={t('casas.zonaDelicada')} />
      <Card>
        {esAdmin ? (
          renombrando ? (
            <>
              <TextField
                label={t('casas.nombre')}
                value={nombreNuevo}
                onChangeText={setNombreNuevo}
                onSubmitEditing={guardarNombre}
                returnKeyType="done"
                autoFocus
              />
              <View style={styles.acciones}>
                <Button label={t('acciones.guardar')} onPress={guardarNombre} />
                <Button
                  label={t('acciones.cancelar')}
                  variante="texto"
                  onPress={() => setRenombrando(false)}
                />
              </View>
            </>
          ) : (
            <ListRow
              titulo={t('casas.renombrar')}
              flecha={false}
              izquierda={
                <IconTile tamano={32}>
                  <Pencil size={16} strokeWidth={1.75} color={colors.brand} />
                </IconTile>
              }
              onPress={() => {
                setNombreNuevo(casa.name);
                setRenombrando(true);
              }}
            />
          )
        ) : null}

        {esAdmin && !renombrando ? <Divider /> : null}

        <ListRow
          titulo={t('casas.salirDeCasa')}
          flecha={false}
          izquierda={
            <IconTile tamano={32} fondo={colors.warningSoft}>
              <DoorOpen size={16} strokeWidth={1.75} color={colors.warning} />
            </IconTile>
          }
          onPress={() => setConfirmando({ que: 'salirCasa' })}
        />

        {esOwner ? (
          <>
            <Divider />
            <ListRow
              titulo={t('casas.borrarCasa')}
              subtitulo={t('casas.borrarTexto')}
              flecha={false}
              izquierda={
                <IconTile tamano={32} fondo={colors.dangerSoft}>
                  <Trash2 size={16} strokeWidth={1.75} color={colors.danger} />
                </IconTile>
              }
              onPress={() => setConfirmando({ que: 'borrarCasa' })}
            />
          </>
        ) : (
          <>
            <Divider />
            <Text style={[typography.caption, { color: colors.textFaint }, styles.nota]}>
              {t('casas.soloOwnerBorra')}
            </Text>
          </>
        )}
      </Card>

      {dialogo ? (
        <ConfirmSheet
          visible
          titulo={dialogo.titulo}
          descripcion={dialogo.descripcion}
          consecuencias={'consecuencias' in dialogo ? dialogo.consecuencias : undefined}
          confirmar={dialogo.confirmar}
          segundaPregunta={'segundaPregunta' in dialogo ? dialogo.segundaPregunta : undefined}
          onConfirmar={ejecutarConfirmacion}
          onCancelar={() => setConfirmando(null)}
        />
      ) : null}
    </Screen>
  );
}

function Seccion({ titulo }: { titulo: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[typography.label, { color: colors.textMuted }, styles.seccion]}>
      {titulo.toUpperCase()}
    </Text>
  );
}

/** Botón pequeño solo con icono. Zona pulsable completa aunque se vea chico. */
function BotonIcono({
  children,
  onPress,
  etiqueta,
}: {
  children: React.ReactNode;
  onPress: () => void;
  etiqueta: string;
}) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.9);
  return (
    <PressableAnimado
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      hitSlop={10}
      style={[styles.botonIcono, animatedStyle]}
    >
      {children}
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  seccion: { paddingTop: layout.sectionGap - layout.cardGap, paddingLeft: spacing.xs },
  anadir: { paddingTop: spacing.sm },
  derecha: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  botonIcono: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  centro: { textAlign: 'center' },
  qr: { alignSelf: 'center', padding: spacing.lg, backgroundColor: '#FFFFFF', borderRadius: radius.md },
  codigo: { textAlign: 'center', letterSpacing: 2 },
  separado: { paddingTop: spacing.sm },
  acciones: { gap: spacing.xs, paddingTop: spacing.sm },
  nota: { paddingVertical: spacing.md },
});
