import { Appearance } from "react-native";

// Detect the current appearance mode
const isDarkMode = Appearance.getColorScheme() === 'dark';

const colors = {
  text: isDarkMode ? 'white' : 'black',
  light_text: isDarkMode ? 'grey' : 'grey',
  background: isDarkMode ? '#14100B' : '#F4F0EB',
  primary: isDarkMode ? '#AC8E68' : '#977953',
  secondary: isDarkMode ? '#241D14' : '#EBE4DA',
  accent: isDarkMode ? '#DDD0C0' : '#3E3222',
};

export default colors;
