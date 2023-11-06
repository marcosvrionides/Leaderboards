import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
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
import LoadingScreen from './LoadingScreen';
import colors from './Colours';

const Home = ({navigation, route}) => {
  const leaderboard = route.params.leaderboard;

  const [currentScreen, setCurrentScreen] = useState('home');

  const [gameHistoryData, setGameHistoryData] = useState([]);
  const [noData, setNoData] = useState();

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
        setNoData(data.length === 0);
        setGameHistoryData(data);
      });
    }, []),
  );

  useEffect(() => {
    const handleNavigateBack = () => {
      navigation.navigate('selectLeaderboard');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleNavigateBack,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: '100%',
          zIndex: 1,
          backgroundColor: colours.translucent_background,
        }}>
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
          <Text style={styles.title} numberOfLines={1}>
            {leaderboard}
          </Text>
          <TouchableOpacity
            style={styles.addGameButton}
            onPress={() =>
              navigation.navigate('addGame', {leaderboard: leaderboard})
            }>
            <Text style={styles.addGameButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {!noData && (
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
        )}
      </View>
      {noData ? (
        <View style={styles.addFirstGameContainer}>
          <TouchableOpacity
            style={styles.addFirstGameButton}
            onPress={() =>
              navigation.navigate('addGame', {leaderboard: leaderboard})
            }>
            <Text style={styles.addFirstGameText}>Add First Game</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {currentScreen === 'home' ? (
            <ScrollView>
              <View style={{height: 90}} />
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
          ) : currentScreen === 'players' ? (
            <ScrollView>
              <View style={{height: 90}} />
              <Players
                leaderboardName={leaderboard}
                gameHistoryData={gameHistoryData}
              />
            </ScrollView>
          ) : null}
        </View>
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
    backgroundColor: colours.translucent_background,
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
    backgroundColor: colours.translucent_background,
    flex: 1,
    borderColor: colours.accent,
  },
  navigationBarButtonText: {
    textAlign: 'center',
    color: colours.text,
    fontSize: 15,
  },
  addFirstGameContainer: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFirstGameButton: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 10,
  },
  addFirstGameText: {
    color: colors.text,
    fontSize: 18,
  },
});
