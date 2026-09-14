import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from './tokens';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  /** Texto de ayuda bajo el campo. */
  ayuda?: string;
  /** Mensaje de error. Si viene, el campo se marca en rojo. */
  error?: string | null;
}

/**
 * Campo de texto con etiqueta, ayuda y error.
 *
 * El error se enseña DEBAJO y en rojo, nunca sustituyendo a la etiqueta:
 * si al fallar desaparece el nombre del campo, el usuario pierde el sitio.
 */
export function TextField({ label, ayuda, error, ...resto }: TextFieldProps) {
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={styles.grupo}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...resto}
        onFocus={(e) => {
          setEnfocado(true);
          resto.onFocus?.(e);
        }}
        onBlur={(e) => {
          setEnfocado(false);
          resto.onBlur?.(e);
        }}
        placeholderTextColor={colors.textFaint}
        style={[
          styles.input,
          enfocado && styles.enfocado,
          error ? styles.conError : null,
        ]}
        accessibilityLabel={label}
      />
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : ayuda ? (
        <Text style={styles.ayuda}>{ayuda}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: spacing.xs },
  label: { ...typography.label, color: colors.textMuted, textTransform: 'uppercase' },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
  },
  enfocado: { borderColor: colors.brand },
  conError: { borderColor: colors.danger },
  error: { ...typography.caption, color: colors.danger },
  ayuda: { ...typography.caption, color: colors.textFaint },
});
