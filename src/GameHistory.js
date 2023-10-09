import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import colours from './Colours';
import database from '@react-native-firebase/database';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';

const GameHistory = ({leaderboardName}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [gameHistoryData, setGameHistoryData] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      setGameHistoryData([]);
      setIsExpanded(false);
      const game_history_ref = database().ref('/' + leaderboardName);
      game_history_ref.once('value', snapshot => {
        snapshot.forEach(childSnapshot => {
          if (childSnapshot.key !== 'password') {
            setGameHistoryData(previousState => [
              ...previousState,
              childSnapshot.val(),
            ]);
          }
        });
      });
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game History</Text>
      <View style={styles.tableHeaderRow}>
        <Text style={styles.columnHeader}>Date</Text>
        <Text style={styles.columnHeader}>Player 1</Text>
        <Text style={styles.columnHeader}>Score</Text>
        <Text style={styles.columnHeader}>Player 2</Text>
      </View>
      {gameHistoryData
        .sort((a, b) => {
          return b.timestamp - a.timestamp;
        })
        .slice(0, isExpanded ? gameHistoryData.length : 6)
        .map((item, index) => {
          const date = new Date(item.timestamp);
          const formatedDate =
            date.getDate() +
            '/' +
            (date.getMonth() + 1) +
            '/' +
            date.getFullYear();
          return (
            <View
              style={[
                styles.tableRow,
                index === 3 && !isExpanded
                  ? {opacity: 0.75}
                  : index === 4 && !isExpanded
                  ? {opacity: 0.5}
                  : index === 5 && !isExpanded
                  ? {opacity: 0.25}
                  : {opacity: 1},
              ]}
              key={index}>
              <Text style={styles.tableCell} numberOfLines={1}>
                {formatedDate}
              </Text>
              <Text style={styles.tableCell} numberOfLines={1}>
                {item.player_1_name}
                {item.player_1_games_won > item.player_2_games_won && ' 👑'}
              </Text>
              <Text style={styles.tableCell} numberOfLines={1}>
                {item.player_1_games_won} - {item.player_2_games_won}
              </Text>
              <Text style={styles.tableCell} numberOfLines={1}>
                {item.player_2_name}
                {item.player_1_games_won < item.player_2_games_won && ' 👑'}
              </Text>
            </View>
          );
        })}
      {gameHistoryData.length > 3 && (
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

export default GameHistory;

const styles = StyleSheet.create({
  container: {
    height: 'fit-content',
    width: '95%',
    backgroundColor: colours.lighter_background,
    borderRadius: 10,
    elevation: 7,
    padding: 10,
    margin: 10,
    marginBottom: 20,
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
  showMoreButton: {
    padding: 10,
  },
  showMoreButtonText: {
    textAlign: 'center',
    color: colours.accent,
    fontSize: 14,
  },
});
