import { router } from 'expo-router';
import { House, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { crearCasa, useCasaActiva } from '@/core/homes';
import { mensajeDe } from '@/lib/errores';
import { t } from '@/lib/i18n';
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  Entrada,
  ErrorState,
  EsqueletoLista,
  IconTile,
  ListRow,
  Screen,
  TextField,
  spacing,
  useAviso,
  useTheme,
} from '@/ui';

/**
 * Mis casas.
 *
 * Lee la lista del provider y no del servidor: crear o borrar una casa
 * aquí tiene que notarse al instante en el selector de Inicio, y eso
 * solo pasa si hay una sola lista para toda la app.
 */
export default function CasasScreen() {
  const { colors } = useTheme();
  const { avisarExito, avisarAviso } = useAviso();
  const { casas, cargando, error, recargar } = useCasaActiva();
  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (!nombre.trim()) return;
    setGuardando(true);
    try {
      await crearCasa(nombre);
      setNombre('');
      setCreando(false);
      avisarExito(t('casas.creada'));
      recargar();
    } catch (fallo) {
      // El mensaje real del servidor, no un "algo ha fallado": esconder
      // el error de PostgREST nos costó horas la última vez.
      avisarAviso(mensajeDe(fallo));
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <Screen title={t('casas.titulo')}>
        <EsqueletoLista filas={2} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen title={t('casas.titulo')}>
        <ErrorState
          titulo={t('errores.cargar')}
          detalle={t('errores.cargarDetalle')}
          tecnico={error}
          onReintentar={recargar}
        />
      </Screen>
    );
  }

  const vacia = casas.length === 0;

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
        <Entrada>
          <Card>
            {casas.map((casa, i) => (
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
        </Entrada>
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
