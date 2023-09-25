import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState, useEffect} from 'react';
import colours from './Colours';
import database from '@react-native-firebase/database';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const GameHistory = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [gameHistoryData, setGameHistoryData] = useState([]);
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

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Game History</Text>
          <TouchableOpacity onPress={() => setRefreshing(!refresh)}>
            <MaterialCommunityIcons
              name={'refresh'}
              size={28}
              color={colours.text}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.columnHeader}>Date</Text>
          <Text style={styles.columnHeader}>Player 1</Text>
          <Text style={styles.columnHeader}>Score</Text>
          <Text style={styles.columnHeader}>Player 2</Text>
        </View>
        {gameHistoryData
          .slice(0, isExpanded ? gameHistoryData.length : 3)
          .map((item, index) => {
            const date = new Date(item.timestamp);
            const formatedDate =
              date.getDate() +
              '/' +
              (date.getMonth() + 1) +
              '/' +
              date.getFullYear();
            return (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCell}>{formatedDate}</Text>
                <Text style={styles.tableCell}>{item.player_1_name}</Text>
                <Text style={styles.tableCell}>
                  {item.player_1_games_won} - {item.player_2_games_won}
                </Text>
                <Text style={styles.tableCell}>{item.player_2_name}</Text>
              </View>
            );
          })}
      </View>
      {gameHistoryData.length > 3 && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={styles.showMoreButtonText}>
            {isExpanded ? '- less' : '+ more'}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default GameHistory;

const styles = StyleSheet.create({
  container: {
    height: 'fit-content',
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
