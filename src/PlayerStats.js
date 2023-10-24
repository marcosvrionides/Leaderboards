import {StyleSheet, Text, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import colors from './Colours';

const PlayerStats = ({leaderboardName, gameHistoryData, filterName}) => {
  const [playerStats, setPlayerStats] = useState();

  useEffect(() => {
    const playerStatsMap = {}; // Create an empty object to store leaderboard data

    // Loop through the gameHistoryData
    for (let i = 0; i < gameHistoryData.length; i++) {
      const player1Name = gameHistoryData[i].player_1_name;
      const player2Name = gameHistoryData[i].player_2_name;
      const player1Wins = parseInt(gameHistoryData[i].player_1_games_won, 10); // Convert to integer
      const player2Wins = parseInt(gameHistoryData[i].player_2_games_won, 10); // Convert to integer
      const winner = player1Wins > player2Wins ? player1Name : player2Name;

      // Update player 1's wins in the playerStatsMap
      if (playerStatsMap[player1Name]) {
        playerStatsMap[player1Name].individualGamesWon += player1Wins;
        playerStatsMap[player1Name].individualGamesLost += player2Wins;
        if (winner === player1Name) {
          playerStatsMap[player1Name].setsWon += 1;
        } else {
          playerStatsMap[player1Name].setsLossed += 1;
        }
      } else if (winner === player1Name) {
        playerStatsMap[player1Name] = {
          player: player1Name,
          setsWon: 1,
          setsLossed: 0,
          individualGamesWon: player1Wins,
          individualGamesLost: player2Wins,
          winRate: 100,
        };
      } else {
        playerStatsMap[player1Name] = {
          player: player1Name,
          setsWon: 0,
          setsLossed: 1,
          individualGamesWon: player1Wins,
          individualGamesLost: player2Wins,
          winRate: 0,
        };
      }

      // Update player 2's wins in the playerStatsMap
      if (playerStatsMap[player2Name]) {
        playerStatsMap[player2Name].individualGamesWon += player2Wins;
        playerStatsMap[player2Name].individualGamesLost += player1Wins;
        if (winner === player2Name) {
          playerStatsMap[player2Name].setsWon += 1;
        } else {
          playerStatsMap[player2Name].setsLossed += 1;
        }
      } else if (winner === player2Name) {
        playerStatsMap[player2Name] = {
          player: player2Name,
          setsWon: 1,
          setsLossed: 0,
          individualGamesWon: player2Wins,
          individualGamesLost: player1Wins,
          winRate: 100,
        };
      } else {
        playerStatsMap[player2Name] = {
          player: player2Name,
          setsWon: 0,
          setsLossed: 1,
          individualGamesWon: player2Wins,
          individualGamesLost: player1Wins,
          winRate: 0,
        };
      }
    }

    // Calculate and update sets win rates for all players
    for (const playerName in playerStatsMap) {
      const playerData = playerStatsMap[playerName];
      const {setsWon, setsLossed} = playerData;

      if (setsWon + setsLossed > 0) {
        const setsWinRate = (setsWon / (setsWon + setsLossed)) * 100;
        playerData.setsWinRate = Math.round(setsWinRate);
      }
    }

    // Calculate and update individual games win rates for all players
    for (const playerName in playerStatsMap) {
      const playerData = playerStatsMap[playerName];
      const {individualGamesWon, individualGamesLost} = playerData;

      if (individualGamesWon + individualGamesLost > 0) {
        const individualGamesWinRate =
          (individualGamesWon / (individualGamesWon + individualGamesLost)) *
          100;
        playerData.individualGamesWinRate = Math.round(individualGamesWinRate);
      }
    }

    // Convert the playerStatsMap object to an array
    const tempplayerStats = Object.values(playerStatsMap);

    setPlayerStats(tempplayerStats);
  }, [gameHistoryData]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Player Stats</Text>
      {playerStats !== undefined &&
        playerStats.map((item, index) => {
          if (item.player === filterName) {
            return (
              <View style={styles.tableContainer} key={index}>
                <View style={styles.tableColumn}>
                  <Text style={styles.tableHeader}>Sets</Text>
                  <Text style={styles.tableCell}>
                    Win rate: {item.setsWinRate}%
                  </Text>
                  <Text style={styles.tableCell}>Wins: {item.setsWon}</Text>
                  <Text style={styles.tableCell}>
                    Losses: {item.setsLossed}
                  </Text>
                </View>
                <View style={styles.tableColumn}>
                  <Text style={styles.tableHeader}>Individual Games</Text>
                  <Text style={styles.tableCell}>
                    Win rate: {item.individualGamesWinRate}%
                  </Text>
                  <Text style={styles.tableCell}>
                    Wins: {item.individualGamesWon}
                  </Text>
                  <Text style={styles.tableCell}>
                    Losses: {item.individualGamesLost}
                  </Text>
                </View>
              </View>
            );
          }
        })}
    </View>
  );
};

export default PlayerStats;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    marginVertical: 10,
    elevation: 7,
    padding: 10,
  },
  title: {
    fontSize: 28,
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  tableContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  tableColumn: {
    alignItems: 'center',
    flex: 1,
  },
  tableHeader: {
    color: colors.accent,
    fontSize: 18,
    width: '95%',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderColor: colors.accent,
    marginBottom: 5,
  },
  tableCell: {
    color: colors.text,
    fontSize: 15,
  },
});
