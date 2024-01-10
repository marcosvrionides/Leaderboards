import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import colours from './Colours';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LoadingScreen from './LoadingScreen';

const SetsLeaderboard = ({leaderboardName, gameHistoryData}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [LeaderboardData, setLeaderboardData] = useState([]);
  const [sortBy, setSortBy] = useState('default');
  const [sortAscending, setSortAscending] = useState(false);

  useEffect(() => {
    const leaderboardDataMap = {}; // Create an empty object to store leaderboard data

    // Loop through the gameHistoryData
    for (let i = 0; i < gameHistoryData.length; i++) {
      const player1Name = gameHistoryData[i].player_1_name;
      const player2Name = gameHistoryData[i].player_2_name;
      const player1Wins = parseInt(gameHistoryData[i].player_1_games_won, 10); // Convert to integer
      const player2Wins = parseInt(gameHistoryData[i].player_2_games_won, 10); // Convert to integer
      const winner = player1Wins > player2Wins ? player1Name : player2Name;

      // Update player 1's wins in the leaderboardDataMap
      if (leaderboardDataMap[player1Name]) {
        if (winner === player1Name) {
          leaderboardDataMap[player1Name].wins += 1;
        } else {
          leaderboardDataMap[player1Name].losses += 1;
        }
      } else if (winner === player1Name) {
        leaderboardDataMap[player1Name] = {
          player: player1Name,
          wins: 1,
          losses: 0,
          winRate: 100,
        };
      } else {
        leaderboardDataMap[player1Name] = {
          player: player1Name,
          wins: 0,
          losses: 1,
          winRate: 0,
        };
      }

      // Update player 2's wins in the leaderboardDataMap
      if (leaderboardDataMap[player2Name]) {
        if (winner === player2Name) {
          leaderboardDataMap[player2Name].wins += 1;
        } else {
          leaderboardDataMap[player2Name].losses += 1;
        }
      } else if (winner === player2Name) {
        leaderboardDataMap[player2Name] = {
          player: player2Name,
          wins: 1,
          losses: 0,
          winRate: 100,
        };
      } else {
        leaderboardDataMap[player2Name] = {
          player: player2Name,
          wins: 0,
          losses: 1,
          winRate: 0,
        };
      }
    }

    // Calculate and update win rates for all players
    for (const playerName in leaderboardDataMap) {
      const playerData = leaderboardDataMap[playerName];
      const {wins, losses} = playerData;

      if (wins + losses > 0) {
        const winRate = (wins / (wins + losses)) * 100;
        playerData.winRate = Math.round(winRate);
        playerData.Score = ci_lower_bound(leaderboardDataMap[playerName]);
      }
    }

    // Convert the leaderboardDataMap object to an array
    const tempLeaderboardData = Object.values(leaderboardDataMap);

    setLeaderboardData(tempLeaderboardData);
  }, [gameHistoryData]);

  const ci_lower_bound = player => {
    if (player.wins + player.losses === 0) {
      return 0;
    }
    const z = 1.96;
    const n = player.wins + player.losses;
    const phat = player.wins / n;
    const score =
      (phat +
        (z * z) / (2 * n) -
        z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * n)) / n)) /
      (1 + (z * z) / n);
    return score;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Games</Text>
      <View style={styles.tableHeaderRow}>
        <Text
          style={[
            styles.columnHeaderText,
            styles.columnHeader,
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
            )}
            {sortBy === 'wins' && ' '}
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
            )}
            {sortBy === 'losses' && ' '}
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
            )}
            {sortBy === 'winRate' && ' '}
            Win Rate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.columnHeader}
          onPress={() => {
            setSortBy('default');
            setSortAscending(sortBy !== 'default' ? false : !sortAscending);
          }}>
          <Text style={styles.columnHeaderText}>
            {sortBy === 'default' && (
              <FontAwesome5
                name={
                  sortAscending ? 'sort-amount-up-alt' : 'sort-amount-down-alt'
                }
                color={colours.text}
              />
            )}
            {sortBy === 'default' && ' '}
            Score
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
          } else if (sortBy === 'default') {
            if (sortAscending) {
              return ci_lower_bound(a) - ci_lower_bound(b);
            } else {
              return ci_lower_bound(b) - ci_lower_bound(a);
            }
          }
        })
          .slice(0, isExpanded ? LeaderboardData.length : 3)
          .map((item, index) => (
            <View
              style={[
                styles.tableRow,
                index % 2 !== 0 && {
                  backgroundColor: colours.lighter_background,
                },
                (index === LeaderboardData.length - 1 ||
                  (index === 2 && !isExpanded)) && {borderBottomWidth: 0},
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
              <Text style={styles.tableCell} numberOfLines={1}>
                {Math.round(item.Score * 100)}
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

export default SetsLeaderboard;

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
    marginHorizontal: 1,
  },
  columnHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colours.text,
    textAlign: 'center',
  },
  narrowColumn: {
    flex: 0.3,
    marginHorizontal: 1,
  },
  tableRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  tableCell: {
    flex: 1,
    fontSize: 15,
    color: colours.text,
    textAlign: 'center',
    marginHorizontal: 1,
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
