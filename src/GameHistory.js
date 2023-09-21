import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Colours from './Colours';

const GameHistory = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const dummyGameHistoryData = [
    {
      id: 1,
      date: '2023-09-15',
      player1: 'Alice',
      score: '3 - 2',
      player2: 'Bob',
    },
    {
      id: 2,
      date: '2023-09-14',
      player1: 'Eve',
      score: '4 - 1',
      player2: 'Charlie',
    },
    {
      id: 3,
      date: '2023-09-13',
      player1: 'David',
      score: '2 - 2',
      player2: 'Frank',
    },
    {
      id: 4,
      date: '2023-09-13',
      player1: 'David',
      score: '2 - 2',
      player2: 'Frank',
    },
  ];
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Game History</Text>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.columnHeader}>Date</Text>
          <Text style={styles.columnHeader}>Player 1</Text>
          <Text style={styles.columnHeader}>Score</Text>
          <Text style={styles.columnHeader}>Player 2</Text>
        </View>
        {dummyGameHistoryData
          .slice(0, isExpanded ? dummyGameHistoryData.length : 3)
          .map((item, index) => (
            <View style={styles.tableRow} key={item.id}>
              <Text style={styles.tableCell}>{item.date}</Text>
              <Text style={styles.tableCell}>{item.player1}</Text>
              <Text style={styles.tableCell}>{item.score}</Text>
              <Text style={styles.tableCell}>{item.player2}</Text>
            </View>
          ))}
      </View>
      {dummyGameHistoryData.length > 3 && (
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <Text style={styles.showMoreButtonText}>
            {isExpanded ? '- hide' : '+ show more'}
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
    width: '100%',
    backgroundColor: Colours.secondary,
    borderRadius: 10,
    elevation: 7,
    padding: 10,
  },
  title: {
    fontSize: 28,
    color: Colours.text,
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
    color: Colours.text,
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
    color: Colours.text,
    textAlign: 'center',
  },
  showMoreButtonText: {
    textAlign: 'center',
    color: Colours.primary,
    fontSize: 14,
  },
});
