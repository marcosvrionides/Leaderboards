import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import colours from './Colours';
import Leaderboard from './Leaderboard';
import GameHistory from './GameHistory';

const Home = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backgammon</Text>
      <ScrollView style={styles.scrollView}>
        <Leaderboard />
        <GameHistory />
      </ScrollView>
      <TouchableOpacity
        style={styles.addGameButton}
        onPress={() => navigation.navigate('addGame')}>
        <Text style={styles.addGameButtonText}>Add game</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colours.background,
    height: '100%',
    display: 'flex',
  },
  scrollView: {
  },
  title: {
    fontFamily: 'times new roman',
    fontSize: 30,
    fontWeight: 'bold',
    color: colours.text,
    padding: 10,
  },
  addGameButton: {
    width: '95%',
    margin: 10,
    backgroundColor: colours.secondary,
    borderRadius: 10,
    elevation: 7,
  },
  addGameButtonText: {
    fontSize: 20,
    color: colours.text,
    textAlign: 'center',
    padding: 15,
  },
});
