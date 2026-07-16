export const typography = {
  displayLarge: {
    fontFamily: 'Audiowide_400Regular',
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily: 'Audiowide_400Regular',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: 'Audiowide_400Regular',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: 'Karla_700Bold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: 'Karla_700Bold',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  titleMedium: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontFamily: 'Karla_400Regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: 'Karla_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: 'Karla_400Regular',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: 'Karla_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: 'Karla_700Bold',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  monoLarge: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -1,
  },
  monoMedium: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  monoSmall: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
};

export type TypographyKeys = keyof typeof typography;
