import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useColorScheme,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  label: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  error?: string;
  mask?: (val: string) => string;
}

export function FormInput({
  label,
  iconName,
  error,
  mask,
  value = '',
  onChangeText,
  onFocus,
  onBlur,
  style,
  ...rest
}: FormInputProps) {
  const isDark = useColorScheme() === 'dark';
  const [isFocused, setIsFocused] = useState(false);

  // Cores dinâmicas para o tema
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const placeholderColor = isDark ? '#64748B' : '#94A3B8';
  const backgroundColor = isDark ? '#1E293B' : '#FFFFFF';
  
  // Cores de borda baseadas no estado (foco, erro, repouso)
  let borderColor = isDark ? '#334155' : '#E2E8F0';
  if (isFocused) {
    borderColor = isDark ? '#60A5FA' : '#007AFF';
  } else if (error) {
    borderColor = '#EF4444';
  }

  const handleTextChange = (text: string) => {
    if (onChangeText) {
      const formattedText = mask ? mask(text) : text;
      onChangeText(formattedText);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? '#94A3B8' : '#475569' }]}>
        {label}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor,
            borderColor,
          },
        ]}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color={error ? '#EF4444' : isFocused ? (isDark ? '#60A5FA' : '#007AFF') : '#64748B'}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[styles.input, { color: textColor }, style]}
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={handleTextChange}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...rest}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});
