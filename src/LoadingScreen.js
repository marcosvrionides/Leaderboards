import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import colors from './Colours';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  LoadingText: {
    color: colors.light_text,
    fontSize: 15,
  },
});

export default LoadingScreen;
