import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Colours from './Colours';

const Leaderboard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

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
        <Text style={styles.title}>Leaderboard</Text>
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
            {isExpanded ? '- hide' : '+ show more'}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default Leaderboard;

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
