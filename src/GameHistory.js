import {StyleSheet, Text, TouchableOpacity, View, Modal} from 'react-native';
import React, {useState} from 'react';
import colours from './Colours';
import database from '@react-native-firebase/database';
import {useFocusEffect} from '@react-navigation/native';
import GameCard from './GameCard';

const GameHistory = ({leaderboardName}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [gameHistoryData, setGameHistoryData] = useState([]);
  const [renderedData, setRenderedData] = useState(5);

  useFocusEffect(
    React.useCallback(() => {
      setGameHistoryData([]);
      setIsExpanded(false);
      const game_history_ref = database().ref('/' + leaderboardName);
      game_history_ref.once('value', snapshot => {
        const data = [];
        snapshot.forEach(childSnapshot => {
          if (childSnapshot.key !== 'password') {
            const gameData = childSnapshot.val(); // Get the value object
            gameData.key = childSnapshot.key; // Add the key as an attribute
            data.push(gameData);
          }
        });
        setGameHistoryData(data);
      });
    }, []),
  );

  const handleLoadMore = () => {
    if (renderedData < gameHistoryData.length + 5) {
      setRenderedData(prevState => prevState + 5);
    } else if (renderedData >= gameHistoryData.length) {
      setRenderedData(5);
    } else {
      setRenderedData(gameHistoryData.length);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game History</Text>
      {gameHistoryData
        .sort((a, b) => {
          return b.timestamp - a.timestamp;
        })
        .slice(0, renderedData)
        .map((item, index) => {
          return <GameCard gameData={item} key={index} />;
        })}
      {gameHistoryData.length > 3 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => handleLoadMore()}>
          <Text style={styles.showMoreButtonText}>
            {renderedData >= gameHistoryData.length ? '- less' : '+ more'}
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
  showMoreButton: {
    padding: 10,
  },
  showMoreButtonText: {
    textAlign: 'center',
    color: colours.accent,
    fontSize: 14,
  },
});
