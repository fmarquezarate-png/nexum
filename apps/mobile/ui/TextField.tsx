import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from './ThemeProvider';
import { radius, spacing, typography } from './tokens';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  ayuda?: string;
  error?: string | null;
}

/**
 * Campo de texto con etiqueta, ayuda y error.
 *
 * El error va DEBAJO y en rojo, nunca sustituyendo a la etiqueta: si al
 * fallar desaparece el nombre del campo, el usuario pierde el sitio.
 */
export function TextField({ label, ayuda, error, editable = true, ...resto }: TextFieldProps) {
  const { colors } = useTheme();
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={styles.grupo}>
      <Text style={[typography.label, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>

      <TextInput
        {...resto}
        editable={editable}
        onFocus={(e) => {
          setEnfocado(true);
          resto.onFocus?.(e);
        }}
        onBlur={(e) => {
          setEnfocado(false);
          resto.onBlur?.(e);
        }}
        placeholderTextColor={colors.textFaint}
        keyboardAppearance={colors.keyboardAppearance}
        style={[
          typography.body,
          styles.input,
          {
            color: editable ? colors.text : colors.textMuted,
            backgroundColor: colors.surfaceSunken,
            // El campo se lee como campo porque está HUNDIDO, no porque
            // tenga contorno: el borde aparece solo cuando hace falta
            // señalar algo (el foco o un error).
            borderColor: error ? colors.danger : enfocado ? colors.brand : 'transparent',
          },
        ]}
        accessibilityLabel={label}
      />

      {error ? (
        <Text
          style={[typography.caption, { color: colors.danger }]}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : ayuda ? (
        <Text style={[typography.caption, { color: colors.textMuted }]}>{ayuda}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
});
