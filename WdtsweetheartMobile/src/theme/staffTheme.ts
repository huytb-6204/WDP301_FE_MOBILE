export const staffLightColors = {
  screen: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F6F8',
  text: '#111827',
  textStrong: '#212B36',
  textMuted: '#637381',
  textSoft: '#919EAB',
  border: '#F4F6F8',
  iconSurface: '#F4F6F8',
  shadow: '#000000',
  badgeBorder: '#FFFFFF',
};

export const staffDarkColors = {
  screen: '#0A0E17',
  surface: '#161C24',
  surfaceMuted: '#212B36',
  text: '#FFFFFF',
  textStrong: '#FFFFFF',
  textMuted: '#AAB6C3',
  textSoft: '#7D8A99',
  border: '#25303B',
  iconSurface: '#212B36',
  shadow: '#000000',
  badgeBorder: '#161C24',
};

export const getStaffThemeColors = (isDarkMode: boolean) =>
  isDarkMode ? staffDarkColors : staffLightColors;
