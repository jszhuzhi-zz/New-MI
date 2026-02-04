import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocale } from '../hooks/useLocale';
import { Locale } from '../store/app';

const COLORS = {
  primary: '#00694B',
  primaryLight: '#E8F5EF',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E0E0E0',
};

interface LocaleSwitcherProps {
  expanded?: boolean;
}

const LocaleSwitcher: React.FC<LocaleSwitcherProps> = ({ expanded = false }) => {
  const { locale, setLocale, localeOptions } = useLocale();

  if (expanded) {
    return (
      <View style={styles.expandedContainer}>
        {localeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.expandedOption,
              locale === option.value && styles.expandedOptionActive,
            ]}
            onPress={() => setLocale(option.value)}
          >
            <Text
              style={[
                styles.expandedOptionText,
                locale === option.value && styles.expandedOptionTextActive,
              ]}
            >
              {option.nativeLabel}
            </Text>
            {locale === option.value && (
              <View style={styles.checkIcon}>
                <View style={styles.checkMark} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  // Compact: inline switcher
  return (
    <View style={styles.compactContainer}>
      {localeOptions.map((option, index) => (
        <React.Fragment key={option.value}>
          <TouchableOpacity
            style={[
              styles.compactOption,
              locale === option.value && styles.compactOptionActive,
            ]}
            onPress={() => setLocale(option.value)}
          >
            <Text
              style={[
                styles.compactOptionText,
                locale === option.value && styles.compactOptionTextActive,
              ]}
            >
              {option.value === 'zh-TW' ? '繁' : option.value === 'zh-CN' ? '简' : 'EN'}
            </Text>
          </TouchableOpacity>
          {index < localeOptions.length - 1 && <View style={styles.compactDivider} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  // Compact
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  compactOption: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  compactOptionActive: {
    backgroundColor: COLORS.primary,
  },
  compactOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  compactOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  compactDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
  },

  // Expanded
  expandedContainer: {
    gap: 6,
  },
  expandedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
  },
  expandedOptionActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  expandedOptionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  expandedOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    width: 8,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
  },
});

export default LocaleSwitcher;
