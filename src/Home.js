import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Colours from './Colours';
import Leaderboard from './Leaderboard';
import GameHistory from './GameHistory';

const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backgammon</Text>
      <Leaderboard />
      <GameHistory />
      <TouchableOpacity style={styles.addGameButton} onPress={() => console.log('test')}>
        <Text style={styles.addGameButtonText}>Add game</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: Colours.background,
    height: '100%',
    display: 'flex',
    gap: 20,
  },
  title: {
    fontFamily: 'times new roman',
    fontSize: 30,
    fontWeight: 'bold',
    color: Colours.text,
  },
  addGameButton: {
    width: '100%',
    backgroundColor: Colours.secondary,
    borderRadius: 10,
    elevation: 7,
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  addGameButtonText: {
    fontSize: 20,
    color: Colours.text,
    textAlign: 'center',
    padding: 15,
  }
});
