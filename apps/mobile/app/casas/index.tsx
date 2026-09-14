import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { crearCasa, listarCasas, type CasaConRol } from '@/core/homes';
import { t } from '@/lib/i18n';
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  ListRow,
  Screen,
  TextField,
  colors,
  spacing,
} from '@/ui';

export default function CasasScreen() {
  const [casas, setCasas] = useState<CasaConRol[] | null>(null);
  const [creando, setCreando] = useState(false);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(() => {
    listarCasas()
      .then(setCasas)
      .catch(() => setCasas([]));
  }, []);

  // Recarga cada vez que se vuelve a esta pantalla: si acabas de salirte
  // de una casa, la lista tiene que reflejarlo.
  useFocusEffect(cargar);

  async function guardar() {
    if (!nombre.trim()) return;
    setGuardando(true);
    try {
      await crearCasa(nombre);
      setNombre('');
      setCreando(false);
      cargar();
    } finally {
      setGuardando(false);
    }
  }

  if (casas === null) {
    return (
      <Screen>
        <ActivityIndicator color={colors.brand} />
      </Screen>
    );
  }

  return (
    <Screen title={t('casas.titulo')}>
      {casas.length === 0 && !creando ? (
        <EmptyState
          titulo={t('casas.vaciaTitulo')}
          descripcion={t('casas.vaciaTexto')}
          accion={{ label: t('casas.crear'), onPress: () => setCreando(true) }}
        />
      ) : (
        <Card>
          {casas.map((casa, i) => (
            <View key={casa.id}>
              {i > 0 && <Divider />}
              <ListRow
                titulo={casa.name}
                subtitulo={casa.timezone}
                onPress={() => router.push(`/casas/${casa.id}`)}
                derecha={<Badge texto={t(`roles.${casa.mi_rol}`)} tono="neutro" />}
              />
            </View>
          ))}
        </Card>
      )}

      {creando ? (
        <Card>
          <TextField
            label={t('casas.nombre')}
            placeholder={t('onboarding.casaPlaceholder')}
            value={nombre}
            onChangeText={setNombre}
            onSubmitEditing={guardar}
            returnKeyType="done"
          />
          <View style={{ gap: spacing.sm, paddingTop: spacing.sm }}>
            <Button label={t('acciones.guardar')} onPress={guardar} cargando={guardando} />
            <Button
              label={t('acciones.cancelar')}
              variante="texto"
              onPress={() => setCreando(false)}
            />
          </View>
        </Card>
      ) : casas.length > 0 ? (
        <Button label={t('casas.nueva')} variante="secundario" onPress={() => setCreando(true)} />
      ) : null}
    </Screen>
  );
}
