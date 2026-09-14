import { useState } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/core/auth';
import { supabase } from '@/lib/supabase';
import { t } from '@/lib/i18n';
import { Button, Screen, TextField, spacing } from '@/ui';

export default function PerfilScreen() {
  const { perfil, session, refrescarPerfil } = useAuth();
  const [nombre, setNombre] = useState(perfil?.display_name ?? '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    if (!nombre.trim()) return setError(t('auth.faltaNombre'));

    setGuardando(true);
    const { error: fallo } = await supabase
      .from('profiles')
      .update({ display_name: nombre.trim() })
      .eq('id', session!.user.id);
    setGuardando(false);

    if (fallo) setError(t('errores.generico'));
    else await refrescarPerfil();
  }

  return (
    <Screen title={t('ajustes.perfil')}>
      <View style={{ gap: spacing.lg }}>
        <TextField
          label={t('ajustes.nombreVisible')}
          value={nombre}
          onChangeText={setNombre}
          error={error}
        />
        <TextField
          label={t('ajustes.correo')}
          value={session?.user.email ?? ''}
          editable={false}
          ayuda="El correo no se puede cambiar desde aquí."
        />
        <Button label={t('acciones.guardar')} onPress={guardar} cargando={guardando} />
      </View>
    </Screen>
  );
}
