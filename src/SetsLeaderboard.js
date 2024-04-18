import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import colours from './Colours';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LoadingScreen from './LoadingScreen';

const SetsLeaderboard = ({leaderboardName, gameHistoryData}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [LeaderboardData, setLeaderboardData] = useState([]);
  const [sortBy, setSortBy] = useState('winRate');
  const [sortAscending, setSortAscending] = useState(false);

  const updatePlayerData = (
    playerName,
    opponent,
    winner,
    leaderboardDataMap,
    playerScore,
    opponenScore,
  ) => {
    if (!leaderboardDataMap[playerName]) {
      leaderboardDataMap[playerName] = {
        player: playerName,
        wins: 0,
        losses: 0,
        winRate: 0,
        eloRating: 1000, // Initial Elo rating
      };
    }

    if (winner === playerName) {
      leaderboardDataMap[playerName].wins += 1;
    } else {
      leaderboardDataMap[playerName].losses += 1;
    }

    // Calculate Elo rating
    const playerRating = leaderboardDataMap[playerName].eloRating;
    const opponentName = opponent;
    const opponentRating = (
      leaderboardDataMap[opponentName] || {eloRating: 1000}
    ).eloRating;
    const outcome = winner === playerName ? 1 : 0;
    leaderboardDataMap[playerName].eloRating = calculateElo(
      playerRating,
      opponentRating,
      outcome,
      playerScore,
      opponenScore,
    );
  };

  useEffect(() => {
    const leaderboardDataMap = {};

    for (const game of [...gameHistoryData].reverse()) {
      const {
        player_1_name,
        player_2_name,
        player_1_games_won,
        player_2_games_won,
      } = game;
      const player1Wins = parseInt(player_1_games_won, 10);
      const player2Wins = parseInt(player_2_games_won, 10);
      const winner = player1Wins > player2Wins ? player_1_name : player_2_name;

      updatePlayerData(
        player_1_name,
        player_2_name,
        winner,
        leaderboardDataMap,
        player1Wins,
        player2Wins,
      );
      updatePlayerData(
        player_2_name,
        player_1_name,
        winner,
        leaderboardDataMap,
        player2Wins,
        player1Wins,
      );
    }

    for (const playerName in leaderboardDataMap) {
      const {wins, losses} = leaderboardDataMap[playerName];

      if (wins + losses > 0) {
        const winRate = (wins / (wins + losses)) * 100;
        leaderboardDataMap[playerName].winRate = Math.round(winRate);
      }
    }

    const tempLeaderboardData = Object.values(leaderboardDataMap);
    setLeaderboardData(tempLeaderboardData);
  }, [gameHistoryData]);

  // Function to calculate Elo rating
  const calculateElo = (
    playerRating,
    opponentRating,
    outcome,
    playerScore,
    opponentScore,
  ) => {
    const k = 25; // K-factor, determines the sensitivity of the rating change
    const expectedOutcome =
      1 / (1 + 10 ** ((opponentRating - playerRating) / 400));

    // Update the player's rating based on the outcome
    const newRating = playerRating + k * (outcome - expectedOutcome);

    return newRating;
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
          <View style={styles.columnHeaderCell}>
            {sortBy === 'wins' && (
              <FontAwesome5
                name={
                  sortAscending ? 'sort-amount-up-alt' : 'sort-amount-down-alt'
                }
                color={colours.text}
              />
            )}
            <Text style={styles.columnHeaderText}>Wins</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.columnHeader}
          onPress={() => {
            setSortBy('losses');
            setSortAscending(sortBy !== 'losses' ? false : !sortAscending);
          }}>
          <View style={styles.columnHeaderCell}>
            {sortBy === 'losses' && (
              <FontAwesome5
                name={
                  sortAscending ? 'sort-amount-up-alt' : 'sort-amount-down-alt'
                }
                color={colours.text}
              />
            )}
            <Text style={styles.columnHeaderText}>Losses</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.columnHeader}
          onPress={() => {
            setSortBy('winRate');
            setSortAscending(sortBy !== 'winRate' ? false : !sortAscending);
          }}>
          <View style={styles.columnHeaderCell}>
            {sortBy === 'winRate' && (
              <FontAwesome5
                name={
                  sortAscending ? 'sort-amount-up-alt' : 'sort-amount-down-alt'
                }
                color={colours.text}
              />
            )}
            <Text style={styles.columnHeaderText}>Win Rate</Text>
          </View>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.columnHeader}
          onPress={() => {
            setSortBy('default');
            setSortAscending(sortBy !== 'default' ? false : !sortAscending);
          }}>
          <View style={styles.columnHeaderCell}>
            {sortBy === 'default' && (
              <FontAwesome5
                name={
                  sortAscending ? 'sort-amount-up-alt' : 'sort-amount-down-alt'
                }
                color={colours.text}
              />
            )}
            <Text style={styles.columnHeaderText}>Elo</Text>
          </View>
        </TouchableOpacity> */}
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
              return a.eloRating - b.eloRating;
            } else {
              return b.eloRating - a.eloRating;
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
              {/* <Text style={styles.tableCell} numberOfLines={1}>
                {Math.round(item.eloRating)}
              </Text> */}
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
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colours.accent,
    paddingVertical: 5,
  },
  columnHeader: {
    flex: 1,
    marginHorizontal: 1,
  },
  columnHeaderCell: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
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
