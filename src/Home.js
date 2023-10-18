import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect} from 'react';
import colours from './Colours';
import Leaderboard from './Leaderboard';
import SetsLeaderboard from './SetsLeaderboard';
import GameHistory from './GameHistory';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Home = ({navigation, route}) => {
  const leaderboard = route.params.leaderboard;

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.navigate('selectLeaderboard')}>
          <MaterialCommunityIcons
            style={{textAlign: 'center'}}
            name={'arrow-left'}
            size={20}
            color={colours.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{leaderboard}</Text>
        <TouchableOpacity
          style={styles.addGameButton}
          onPress={() =>
            navigation.navigate('addGame', {leaderboard: leaderboard})
          }>
          <Text style={styles.addGameButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        <SetsLeaderboard leaderboardName={leaderboard} />
        <Leaderboard leaderboardName={leaderboard} />
        <GameHistory leaderboardName={leaderboard} />
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colours.lighter_background,
    height: '100%',
    display: 'flex',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    position: 'relative',
    backgroundColor: colours.background,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    color: colours.text,
    padding: 10,
  },
  backArrow: {
    position: 'absolute',
    left: 10,
    width: 50,
    height: '100%',
    justifyContent: 'center',
  },
  addGameButton: {
    position: 'absolute',
    right: 10,
    width: 50,
    height: '100%',
    justifyContent: 'center',
  },
  addGameButtonText: {
    fontSize: 20,
    color: colours.text,
    textAlign: 'center',
  },
});
