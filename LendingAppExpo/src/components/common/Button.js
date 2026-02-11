import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';

const Button = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'medium', // small, medium, large
  fullWidth = false,
  icon,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const styles = [buttonStyles.base];

    // Variant styles
    switch (variant) {
      case 'primary':
        styles.push(buttonStyles.primary);
        break;
      case 'secondary':
        styles.push(buttonStyles.secondary);
        break;
      case 'outline':
        styles.push(buttonStyles.outline);
        break;
      case 'ghost':
        styles.push(buttonStyles.ghost);
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        styles.push(buttonStyles.small);
        break;
      case 'medium':
        styles.push(buttonStyles.medium);
        break;
      case 'large':
        styles.push(buttonStyles.large);
        break;
    }

    if (fullWidth) {
      styles.push(buttonStyles.fullWidth);
    }

    if (disabled) {
      styles.push(buttonStyles.disabled);
    }

    return styles;
  };

  const getTextStyle = () => {
    const styles = [buttonStyles.text];

    switch (variant) {
      case 'primary':
      case 'secondary':
        styles.push(buttonStyles.textLight);
        break;
      case 'outline':
      case 'ghost':
        styles.push(buttonStyles.textDark);
        break;
    }

    switch (size) {
      case 'small':
        styles.push(buttonStyles.textSmall);
        break;
      case 'medium':
        styles.push(buttonStyles.textMedium);
        break;
      case 'large':
        styles.push(buttonStyles.textLarge);
        break;
    }

    return styles;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
        />
      ) : (
        <View style={buttonStyles.content}>
          {icon && <View style={buttonStyles.icon}>{icon}</View>}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    fontWeight: '600',
  },
  textLight: {
    color: colors.white,
  },
  textDark: {
    color: colors.primary,
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
});

export default Button;