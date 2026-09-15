import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { contarDispositivos, SelectorCasa, useCasaActiva } from '@/core/homes';
import { mensajeDe } from '@/lib/errores';
import { t } from '@/lib/i18n';
import {
  Card,
  DataHero,
  EmptyState,
  Entrada,
  ErrorState,
  EsqueletoTarjetas,
  Screen,
  spacing,
} from '@/ui';

/**
 * Estadísticas de la CASA: clima, consumo, cómo va el conjunto.
 *
 * Las de cada oficio —horas de frío, litros regados— viven dentro de su
 * mundo. Aquí se responde "¿cómo va mi casa?", no "¿cómo va mi aire?".
 *
 * El número grande es el ÚNICO dato real que Nexum puede dar hoy:
 * cuántos aparatos hay en la casa activa, contados en la tabla devices.
 * Hoy vale cero, y enseñar un cero verdadero es mejor que enseñar un
 * 22° inventado: el día que emparejemos un ESP32 este número sube solo.
 *
 * NUNCA lleva mascota. Ni Nexi ni ninguna otra: es una pantalla de datos,
 * y un dibujo sonriente encima de una gráfica vacía sobra.
 */
export default function EstadisticasScreen() {
  const { activa, cargando: cargandoCasas, error: errorCasas, recargar } = useCasaActiva();
  const [cuantos, setCuantos] = useState<number | null>(null);
  const [motivo, setMotivo] = useState<string | null>(null);

  const cargar = useCallback(() => {
    if (!activa) return;
    setMotivo(null);
    contarDispositivos(activa.id)
      .then(setCuantos)
      .catch((fallo) => setMotivo(mensajeDe(fallo)));
  }, [activa]);

  useFocusEffect(cargar);

  if (cargandoCasas) {
    return (
      <Screen title={t('estadisticas.titulo')}>
        <EsqueletoTarjetas cuantas={1} alto={160} />
      </Screen>
    );
  }

  const fallo = errorCasas ?? motivo;
  if (fallo) {
    return (
      <Screen title={t('estadisticas.titulo')}>
        <ErrorState
          titulo={t('errores.cargar')}
          detalle={t('errores.cargarDetalle')}
          tecnico={fallo}
          onReintentar={() => {
            recargar();
            cargar();
          }}
        />
      </Screen>
    );
  }

  if (!activa) {
    return (
      <Screen title={t('estadisticas.titulo')}>
        <EmptyState titulo={t('casas.vaciaTitulo')} descripcion={t('casas.vaciaTexto')} />
      </Screen>
    );
  }

  return (
    <Screen title={t('estadisticas.titulo')}>
      <View style={styles.selector}>
        <SelectorCasa />
      </View>

      {cuantos === null ? (
        <EsqueletoTarjetas cuantas={1} alto={160} />
      ) : (
        <Entrada>
          <Card>
            <View style={styles.hero}>
              <DataHero
                valor={cuantos}
                pie={t('estadisticas.dispositivosPie', { casa: activa.name })}
                atenuado={cuantos === 0}
              />
            </View>
          </Card>
        </Entrada>
      )}

      <Entrada indice={1}>
        <EmptyState
          titulo={t('estadisticas.sinDatosTitulo')}
          descripcion={t('estadisticas.sinDatosTexto')}
        />
      </Entrada>
    </Screen>
  );
}

const styles = StyleSheet.create({
  selector: { paddingBottom: spacing.xs },
  hero: { paddingVertical: spacing.lg },
});
