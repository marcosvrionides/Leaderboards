import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colours from './Colours';
import Leaderboard from './Leaderboard';
import SetsLeaderboard from './SetsLeaderboard';
import GameHistory from './GameHistory';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import Players from './Players';
import database from '@react-native-firebase/database';

const Home = ({navigation, route}) => {
  const leaderboard = route.params.leaderboard;

  const [currentScreen, setCurrentScreen] = useState('home');

  const [gameHistoryData, setGameHistoryData] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      setGameHistoryData([]);
      const game_history_ref = database().ref('/' + leaderboard);
      game_history_ref.once('value', snapshot => {
        const data = [];
        snapshot.forEach(childSnapshot => {
          if (childSnapshot.key !== 'password') {
            const gameData = childSnapshot.val();
            gameData.key = childSnapshot.key;
            data.push(gameData);
          }
        });
        setGameHistoryData(data);
      });
    }, []),
  );

  return (
    <View style={styles.container}>
      <View>
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
        <View style={styles.navigationBar}>
          <TouchableOpacity
            style={[
              styles.navigationBarButton,
              currentScreen === 'home' && {borderBottomWidth: 2},
            ]}
            onPress={() => setCurrentScreen('home')}>
            <Text style={styles.navigationBarButtonText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.navigationBarButton,
              currentScreen === 'players' && {borderBottomWidth: 2},
            ]}
            onPress={() => setCurrentScreen('players')}>
            <Text style={styles.navigationBarButtonText}>Players</Text>
          </TouchableOpacity>
        </View>
      </View>
      {currentScreen === 'home' ? (
        <ScrollView>
          <SetsLeaderboard
            leaderboardName={leaderboard}
            gameHistoryData={gameHistoryData}
          />
          <Leaderboard
            leaderboardName={leaderboard}
            gameHistoryData={gameHistoryData}
          />
          <GameHistory
            leaderboardName={leaderboard}
            gameHistoryData={gameHistoryData}
          />
        </ScrollView>
      ) : (
        <ScrollView>
          <Players
            leaderboardName={leaderboard}
            gameHistoryData={gameHistoryData}
          />
        </ScrollView>
      )}
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
  navigationBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navigationBarButton: {
    padding: 10,
    backgroundColor: colours.background,
    flex: 1,
    borderColor: colours.accent,
  },
  navigationBarButtonText: {
    textAlign: 'center',
    color: colours.text,
    fontSize: 15,
  },
});
