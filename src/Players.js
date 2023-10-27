import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from './Colours';
import GameHistory from './GameHistory';
import PlayerStats from './PlayerStats';

const Players = ({leaderboardName, gameHistoryData}) => {
  const [playerNames, setPlayerNames] = useState([]);
  const [viewPlayer, setViewPlayer] = useState();

  useEffect(() => {
    let tempPlayerNames = [];
    for (let i = 0; i < gameHistoryData.length; i++) {
      if (!tempPlayerNames.includes(gameHistoryData[i].player_1_name)) {
        tempPlayerNames.push(gameHistoryData[i].player_1_name);
      }
      if (!tempPlayerNames.includes(gameHistoryData[i].player_2_name)) {
        tempPlayerNames.push(gameHistoryData[i].player_2_name);
      }
    }
    setPlayerNames(tempPlayerNames);
  }, []);

  return (
    <>
      <View style={styles.namesContainer}>
        {playerNames.map((name, index) => (
          <View key={index}>
            <TouchableOpacity onPress={() => setViewPlayer(name)}>
              <Text
                style={[
                  styles.playerName,
                  name === viewPlayer && {
                    fontWeight: 'bold',
                    fontSize: 24,
                  },
                ]}>
                {name}
              </Text>
            </TouchableOpacity>
            {index !== playerNames.length - 1 && (
              <View style={styles.separator} />
            )}
          </View>
        ))}
      </View>
      {viewPlayer !== undefined ? (
        <>
          <PlayerStats
            gameHistoryData={gameHistoryData}
            filterName={viewPlayer}
          />
          <GameHistory
            gameHistoryData={gameHistoryData}
            filterName={viewPlayer}
          />
        </>
      ) : (
        <Text style={{textAlign: 'center', color: colors.light_text}}>
          (Tap a player to view stats)
        </Text>
      )}
    </>
  );
};

export default Players;

const styles = StyleSheet.create({
  namesContainer: {
    backgroundColor: colors.background,
    marginVertical: 10,
    elevation: 7,
    padding: 10,
  },
  playerName: {
    textAlign: 'center',
    color: colors.text,
    fontSize: 20,
  },
  separator: {
    height: 2,
    width: '95%',
    backgroundColor: colors.accent,
    margin: 10,
  },
});
