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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Home = ({navigation, route}) => {
  const leaderboard = route.params.leaderboard;

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('selectLeaderboard')}>
          <MaterialCommunityIcons
            name={'arrow-left'}
            size={28}
            color={colours.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{leaderboard}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <Leaderboard leaderboardName={leaderboard}/>
        <GameHistory leaderboardName={leaderboard}/>
      </ScrollView>
      <TouchableOpacity
        style={styles.addGameButton}
        onPress={() => navigation.navigate('addGame', {leaderboard: leaderboard})}>
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
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
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
