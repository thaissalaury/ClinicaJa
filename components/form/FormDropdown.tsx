import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DropdownOption {
  label: string;
  value: string;
}

interface FormDropdownProps {
  label: string;
  placeholder: string;
  options: DropdownOption[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

export function FormDropdown({
  label,
  placeholder,
  options,
  selectedValue,
  onValueChange,
  iconName,
  error,
}: FormDropdownProps) {
  const isDark = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = useState(false);

  // Cores dinâmicas
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const placeholderColor = isDark ? '#64748B' : '#94A3B8';
  const backgroundColor = isDark ? '#1E293B' : '#FFFFFF';
  const modalBg = isDark ? '#0F172A' : '#F4F8FB';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderCol = error ? '#EF4444' : isDark ? '#334155' : '#E2E8F0';

  const selectedOption = options.find(opt => opt.value === selectedValue);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: isDark ? '#94A3B8' : '#475569' }]}>
        {label}
      </Text>

      <TouchableOpacity
        style={[
          styles.trigger,
          {
            backgroundColor,
            borderColor: borderCol,
          },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.leftContainer}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={20}
              color={error ? '#EF4444' : '#64748B'}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.triggerText,
              { color: selectedOption ? textColor : placeholderColor },
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>
        <Ionicons
          name="chevron-down-outline"
          size={18}
          color={isDark ? '#94A3B8' : '#64748B'}
        />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={[styles.modalContent, { backgroundColor: modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                Selecione uma opção
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close-circle-outline"
                  size={26}
                  color={isDark ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor: isSelected
                          ? (isDark ? '#1E293B' : '#E6F4FE')
                          : cardBg,
                        borderColor: isSelected
                          ? (isDark ? '#60A5FA' : '#007AFF')
                          : 'transparent',
                      },
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected
                            ? (isDark ? '#60A5FA' : '#007AFF')
                            : textColor,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={isDark ? '#60A5FA' : '#007AFF'}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </SafeAreaView>
        </View>
      </Modal>
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  triggerText: {
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 116, 139, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingVertical: 16,
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionText: {
    fontSize: 16,
  },
});
