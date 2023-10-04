import {Appearance} from 'react-native';

// Detect the current appearance mode
const isDarkMode = Appearance.getColorScheme() === 'dark';

const colors = {
  text: isDarkMode ? 'white' : 'black',
  light_text: 'grey',
  background: isDarkMode ? '#000000' : '#FFFFFF',
  lighter_background: isDarkMode ? '#161616' : '#f7f7f7',
  primary: isDarkMode ? '#2D493B' : '#b6d2c4',
  secondary: isDarkMode ? '#11181C' : '#e3eaee',
  accent: isDarkMode ? '#5F9B7E' : '#64a083',
};

export default colors;
