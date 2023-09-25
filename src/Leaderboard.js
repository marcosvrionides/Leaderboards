import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import colours from './Colours';
import database from '@react-native-firebase/database';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Leaderboard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [gameHistoryData, setGameHistoryData] = useState([]);
  const [LeaderboardData, setLeaderboardData] = useState([]);
  const [refresh, setRefreshing] = useState(false);

  useEffect(() => {
    setGameHistoryData([]);
    setIsExpanded(false);
    const game_history_ref = database().ref('/game_history');
    game_history_ref.once('value', snapshot => {
      snapshot.forEach(childSnapshot => {
        setGameHistoryData(previousState => [
          ...previousState,
          childSnapshot.val(),
        ]);
      });
    });
  }, [refresh]);

  useEffect(() => {
    const leaderboardDataMap = {}; // Create an empty object to store leaderboard data

    // Loop through the gameHistoryData
    for (let i = 0; i < gameHistoryData.length; i++) {
      const player1Name = gameHistoryData[i].player_1_name;
      const player2Name = gameHistoryData[i].player_2_name;
      const player1Wins = parseInt(gameHistoryData[i].player_1_games_won, 10); // Convert to integer
      const player2Wins = parseInt(gameHistoryData[i].player_2_games_won, 10); // Convert to integer

      // Update player 1's wins in the leaderboardDataMap
      if (leaderboardDataMap[player1Name]) {
        leaderboardDataMap[player1Name].wins += player1Wins;
      } else {
        leaderboardDataMap[player1Name] = {
          player: player1Name,
          wins: parseInt(player1Wins),
        };
      }

      // Update player 2's wins in the leaderboardDataMap
      if (leaderboardDataMap[player2Name]) {
        leaderboardDataMap[player2Name].wins += player2Wins;
      } else {
        leaderboardDataMap[player2Name] = {
          player: player2Name,
          wins: parseInt(player2Wins),
        };
      }
    }

    // Convert the leaderboardDataMap object to an array
    const tempLeaderboardData = Object.values(leaderboardDataMap);

    setLeaderboardData(tempLeaderboardData);
  }, [gameHistoryData]);

  console.log(LeaderboardData);

  const dummyLeaderboardData = [
    {id: 1, player: 'John', wins: 10, losses: 5},
    {id: 2, player: 'Alice', wins: 8, losses: 7},
    {id: 3, player: 'Bob', wins: 12, losses: 3},
    {id: 4, player: 'Eve', wins: 6, losses: 9},
    {id: 5, player: 'Charlie', wins: 14, losses: 2},
  ];
  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Leaderboard</Text>
          <TouchableOpacity onPress={() => setRefreshing(!refresh)}>
            <MaterialCommunityIcons
              name={'refresh'}
              size={28}
              color={colours.text}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.columnHeader, styles.narrowColumn]}>#</Text>
          <Text style={styles.columnHeader}>Player</Text>
          <Text style={styles.columnHeader}>Wins</Text>
          <Text style={styles.columnHeader}>Loses</Text>
        </View>
        {dummyLeaderboardData
          .slice(0, isExpanded ? dummyLeaderboardData.length : 3)
          .map((item, index) => (
            <View style={styles.tableRow} key={item.id}>
              <Text style={[styles.tableCell, styles.narrowColumn]}>
                {index + 1}
              </Text>
              <Text style={styles.tableCell}>{item.player}</Text>
              <Text style={styles.tableCell}>{item.wins}</Text>
              <Text style={styles.tableCell}>{item.losses}</Text>
            </View>
          ))}
      </View>
      {dummyLeaderboardData.length > 3 && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={styles.showMoreButtonText}>
            {isExpanded ? '- less' : '+ more'}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default Leaderboard;

const styles = StyleSheet.create({
  container: {
    width: '95%',
    backgroundColor: colours.secondary,
    borderRadius: 10,
    elevation: 7,
    padding: 10,
    margin: 10,
    marginBottom: 20,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    color: colours.text,
    fontFamily: 'times new roman',
  },
  tableHeaderRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    borderBottomWidth: 1,
    paddingVertical: 5,
  },
  columnHeader: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colours.text,
    textAlign: 'center',
  },
  narrowColumn: {
    flex: 0.25,
  },
  tableRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 5,
  },
  tableCell: {
    flex: 1,
    fontSize: 15,
    color: colours.text,
    textAlign: 'center',
  },
  showMoreButtonText: {
    textAlign: 'center',
    color: colours.primary,
    fontSize: 14,
    marginBottom: 10,
  },
});
