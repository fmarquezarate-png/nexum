import { router, useFocusEffect } from 'expo-router';
import { House, Plus } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { crearCasa, listarCasas, type CasaConRol } from '@/core/homes';
import { mensajeDe } from '@/lib/errores';
import { t } from '@/lib/i18n';
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  ErrorState,
  IconTile,
  ListRow,
  Loading,
  Screen,
  TextField,
  spacing,
  useAviso,
  useTheme,
} from '@/ui';

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'listo'; casas: CasaConRol[] }
  | { tipo: 'error'; motivo: string };

export default function CasasScreen() {
  const { colors } = useTheme();
  const { avisarExito, avisarAviso } = useAviso();
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(() => {
    listarCasas()
      .then((casas) => setEstado({ tipo: 'listo', casas }))
      .catch((fallo) => setEstado({ tipo: 'error', motivo: mensajeDe(fallo) }));
  }, []);

  // Recarga al volver: si acabas de salirte de una casa o de borrarla,
  // la lista tiene que reflejarlo.
  useFocusEffect(cargar);

  async function guardar() {
    if (!nombre.trim()) return;
    setGuardando(true);
    try {
      await crearCasa(nombre);
      setNombre('');
      setCreando(false);
      avisarExito(t('casas.creada'));
      cargar();
    } catch {
      avisarAviso(t('errores.generico'));
    } finally {
      setGuardando(false);
    }
  }

  if (estado.tipo === 'cargando') return <Screen><Loading /></Screen>;

  if (estado.tipo === 'error') {
    return (
      <Screen>
        <ErrorState
          titulo={t('errores.cargar')}
          detalle={t('errores.cargarDetalle')}
          tecnico={estado.motivo}
          onReintentar={cargar}
        />
      </Screen>
    );
  }

  const vacia = estado.casas.length === 0;

  return (
    <Screen title={t('casas.titulo')}>
      {vacia && !creando ? (
        <EmptyState
          quien="nexi"
          titulo={t('casas.vaciaTitulo')}
          descripcion={t('casas.vaciaTexto')}
          accion={{ label: t('casas.crear'), onPress: () => setCreando(true) }}
        />
      ) : null}

      {!vacia ? (
        <Card>
          {estado.casas.map((casa, i) => (
            <View key={casa.id}>
              {i > 0 && <Divider />}
              <ListRow
                titulo={casa.name}
                subtitulo={casa.timezone}
                izquierda={
                  <IconTile>
                    <House size={20} strokeWidth={1.75} color={colors.brand} />
                  </IconTile>
                }
                derecha={<Badge texto={t(`roles.${casa.mi_rol}`)} />}
                onPress={() => router.push(`/casas/${casa.id}`)}
              />
            </View>
          ))}
        </Card>
      ) : null}

      {creando ? (
        <Card>
          <TextField
            label={t('casas.nombre')}
            placeholder={t('onboarding.casaPlaceholder')}
            value={nombre}
            onChangeText={setNombre}
            onSubmitEditing={guardar}
            returnKeyType="done"
            autoFocus
          />
          <View style={styles.acciones}>
            <Button label={t('acciones.guardar')} onPress={guardar} cargando={guardando} />
            <Button
              label={t('acciones.cancelar')}
              variante="texto"
              onPress={() => {
                setCreando(false);
                setNombre('');
              }}
            />
          </View>
        </Card>
      ) : !vacia ? (
        <Button
          label={t('casas.nueva')}
          variante="secundario"
          onPress={() => setCreando(true)}
          icono={<Plus size={18} strokeWidth={2} color={colors.text} />}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  acciones: { gap: spacing.xs, paddingTop: spacing.sm },
});
