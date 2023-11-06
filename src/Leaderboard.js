import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import colours from './Colours';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LoadingScreen from './LoadingScreen';

const Leaderboard = ({leaderboardName, gameHistoryData}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [LeaderboardData, setLeaderboardData] = useState([]);
  const [sortBy, setSortBy] = useState('winRate');
  const [sortAscending, setSortAscending] = useState(false);

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
        leaderboardDataMap[player1Name].losses += player2Wins;
      } else {
        leaderboardDataMap[player1Name] = {
          player: player1Name,
          wins: player1Wins,
          losses: player2Wins,
        };
      }

      // Update player 2's wins in the leaderboardDataMap
      if (leaderboardDataMap[player2Name]) {
        leaderboardDataMap[player2Name].wins += player2Wins;
        leaderboardDataMap[player2Name].losses += player1Wins;
      } else {
        leaderboardDataMap[player2Name] = {
          player: player2Name,
          wins: player2Wins,
          losses: player1Wins,
        };
      }
    }

    // Calculate and update the win rate for each player in the leaderboardDataMap
    for (const playerName in leaderboardDataMap) {
      const playerData = leaderboardDataMap[playerName];
      const totalGames = playerData.wins + playerData.losses;
      if (totalGames > 0) {
        playerData.winRate = Math.round((playerData.wins / totalGames) * 100); // Calculate win rate as a percentage
      } else {
        playerData.winRate = 0; // Default win rate to 0 if no games played
      }
    }

    // Convert the leaderboardDataMap object to an array
    const tempLeaderboardData = Object.values(leaderboardDataMap);

    setLeaderboardData(tempLeaderboardData);
  }, [gameHistoryData]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Total Points</Text>
      <View style={styles.tableHeaderRow}>
        <Text
          style={[
            styles.columnHeader,
            styles.columnHeaderText,
            styles.narrowColumn,
          ]}>
          #
        </Text>
        <Text style={[styles.columnHeader, styles.columnHeaderText]}>
          Player
        </Text>
        <TouchableOpacity
          style={styles.columnHeader}
          onPress={() => {
            setSortBy('wins');
            setSortAscending(sortBy !== 'wins' ? false : !sortAscending);
          }}>
          <Text style={styles.columnHeaderText}>
            {sortBy === 'wins' && (
              <FontAwesome5
                name={
                  sortAscending ? 'sort-amount-up-alt' : 'sort-amount-down-alt'
                }
                color={colours.text}
              />
            )}{' '}
            Wins
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.columnHeader}
          onPress={() => {
            setSortBy('losses');
            setSortAscending(sortBy !== 'losses' ? false : !sortAscending);
          }}>
          <Text style={styles.columnHeaderText}>
            {sortBy === 'losses' && (
              <FontAwesome5
                name={
                  sortAscending ? 'sort-amount-up-alt' : 'sort-amount-down-alt'
                }
                color={colours.text}
              />
            )}{' '}
            Losses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.columnHeader}
          onPress={() => {
            setSortBy('winRate');
            setSortAscending(sortBy !== 'winRate' ? false : !sortAscending);
          }}>
          <Text style={styles.columnHeaderText}>
            {sortBy === 'winRate' && (
              <FontAwesome5
                name={
                  sortAscending ? 'sort-amount-up-alt' : 'sort-amount-down-alt'
                }
                color={colours.text}
              />
            )}{' '}
            Win Rate
          </Text>
        </TouchableOpacity>
      </View>
      {gameHistoryData.length === 0 ? (
        <LoadingScreen />
      ) : (
        LeaderboardData.sort((a, b) => {
          if (sortBy === 'wins') {
            if (sortAscending) {
              return a.wins - b.wins;
            } else {
              return b.wins - a.wins;
            }
          } else if (sortBy === 'losses') {
            if (sortAscending) {
              return a.losses - b.losses;
            } else {
              return b.losses - a.losses;
            }
          } else if (sortBy === 'winRate') {
            if (sortAscending) {
              return a.winRate - b.winRate;
            } else {
              return b.winRate - a.winRate;
            }
          }
        })
          .slice(0, isExpanded ? LeaderboardData.length : 3)
          .map((item, index) => (
            <View
              style={[
                styles.tableRow,
                index === 0 && !isExpanded
                  ? {opacity: 1}
                  : index === 1 && !isExpanded
                  ? {opacity: 0.75}
                  : index === 2 && !isExpanded
                  ? {opacity: 0.5}
                  : {opacity: 1},
              ]}
              key={index}>
              <Text style={[styles.tableCell, styles.narrowColumn]}>
                {index + 1}
              </Text>
              <Text style={styles.tableCell} numberOfLines={1}>
                {item.player}
              </Text>
              <Text style={styles.tableCell} numberOfLines={1}>
                {item.wins}
              </Text>
              <Text style={styles.tableCell} numberOfLines={1}>
                {item.losses}
              </Text>
              <Text style={styles.tableCell} numberOfLines={1}>
                {item.winRate}%
              </Text>
            </View>
          ))
      )}
      {LeaderboardData.length > 3 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={styles.showMoreButtonText}>
            {isExpanded ? '- less' : '+ more'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Leaderboard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colours.background,
    elevation: 7,
    padding: 10,
    marginVertical: 5,
  },
  title: {
    fontSize: 28,
    color: colours.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  tableHeaderRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    borderBottomWidth: 1,
    borderColor: colours.accent,
    paddingVertical: 5,
  },
  columnHeader: {
    flex: 1,
  },
  columnHeaderText: {
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
  showMoreButton: {
    padding: 10,
  },
  showMoreButtonText: {
    textAlign: 'center',
    color: colours.accent,
    fontSize: 14,
  },
});
