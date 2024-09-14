import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colours from './Colours';
import Leaderboard from './Leaderboard';
import SetsLeaderboard from './SetsLeaderboard';
import GameHistory from './GameHistory';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import database from '@react-native-firebase/database';
import colors from './Colours';

const Home = ({navigation, route}) => {
  const leaderboard = route.params.leaderboard;

  const [gameHistoryData, setGameHistoryData] = useState([]);
  const [filteredGameHistoryData, setFilteredGameHistoryData] = useState([]);
  const [noData, setNoData] = useState();

  const [showFilterModal, setShowFilterModal] = useState(false);

  const [leaderboardPlayers, setLeaderboardPlayers] = useState([]);

  const togglePlayerSelection = playerToUpdate => {
    setLeaderboardPlayers(
      leaderboardPlayers.map(player => {
        return player.playername === playerToUpdate.playername
          ? {...player, selected: !player.selected}
          : player;
      }),
    );
  };

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

  const handleFilterByPlayer = () => {
    //idealy this should be done after a game is added and should be stored in firebase so as not use a lot of processing power ever time a user wants to filter.
    var players = [];
    gameHistoryData.forEach(game => {
      if (!players.some(p => p.playername === game.player_1_name)) {
        players.push({playername: game.player_1_name, selected: true});
      }
      if (!players.some(p => p.playername === game.player_2_name)) {
        players.push({playername: game.player_2_name, selected: true});
      }
    });
    setLeaderboardPlayers(players);
    setShowFilterModal(true);
  };

  useEffect(() => {
    const selectedPlayers = leaderboardPlayers
      .filter(player => player.selected)
      .map(player => player.playername);

    const filteredGames = gameHistoryData.filter(
      game =>
        (selectedPlayers.includes(game.player_1_name) &&
          selectedPlayers.includes(game.player_2_name)) ||
        (selectedPlayers.includes(game.player_2_name) &&
          selectedPlayers.includes(game.player_1_name)),
    );

    setFilteredGameHistoryData(filteredGames);
  }, [leaderboardPlayers]);

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
          <Modal
            visible={showFilterModal}
            transparent={true}
            onRequestClose={() => setShowFilterModal(false)}>
            <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
              <View style={styles.filterModalContainer}>
                <TouchableWithoutFeedback>
                  <View style={styles.filterModal}>
                    <Text style={styles.filterByPlayersInstruction}>
                      Filter by player names
                    </Text>
                    <ScrollView vertical>
                      {leaderboardPlayers.map((player, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.playerContainer}
                          onPress={() => togglePlayerSelection(player)}>
                          <View
                            style={[
                              styles.checkbox,
                              player.selected && styles.checkboxSelected,
                            ]}
                          />
                          <Text style={styles.playerName}>
                            {player.playername}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
          <ScrollView>
            <View style={{height: 45}} />
            <View style={styles.filtersContainer}>
              <Text style={styles.filtersLabel}>Filter:</Text>
              <TouchableOpacity
                style={styles.playerFilterButton}
                onPress={() => handleFilterByPlayer()}>
                <Text style={{color: colors.text}}>Players</Text>
              </TouchableOpacity>
            </View>
            <SetsLeaderboard
              leaderboardName={leaderboard}
              gameHistoryData={
                leaderboardPlayers.length > 0
                  ? filteredGameHistoryData
                  : gameHistoryData
              }
            />
            <Leaderboard
              leaderboardName={leaderboard}
              gameHistoryData={
                leaderboardPlayers.length > 0
                  ? filteredGameHistoryData
                  : gameHistoryData
              }
            />
            <GameHistory
              leaderboardName={leaderboard}
              gameHistoryData={
                leaderboardPlayers.length > 0
                  ? filteredGameHistoryData
                  : gameHistoryData
              }
            />
          </ScrollView>
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
    maxWidth: '75%',
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
  filtersContainer: {
    height: 50,
    marginTop: 5,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filtersLabel: {
    height: '100%',
    textAlignVertical: 'center',
    padding: 10,
    color: colors.text,
  },
  playerFilterButton: {
    backgroundColor: colors.accent,
    justifyContent: 'center',
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
  filterModalContainer: {
    height: '100%',
    backgroundColor: colors.translucent_background,
  },
  filterModal: {
    marginVertical: 100,
    backgroundColor: colors.secondary,
    marginHorizontal: 20,
    padding: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000',
    marginRight: 5,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  checkboxSelected: {
    backgroundColor: 'green',
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
    backgroundColor: colors.primary,
    padding: 5,
  },
  filterByPlayersInstruction: {
    color: colors.text,
    textAlign: 'center',
    paddingBottom: 10,
  },
  playerName: {
    color: colors.text,
  },
});
