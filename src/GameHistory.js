import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import colours from './Colours';
import GameCard from './GameCard';
import LoadingScreen from './LoadingScreen';

const GameHistory = ({leaderboardName, gameHistoryData, filterName}) => {
  const [renderedData, setRenderedData] = useState(5);
  const [filteredGameHistoryData, setFiteredGameHistoryData] = useState();

  useEffect(() => {
    if (filterName !== undefined) {
      const tempGameHistoryData = gameHistoryData.filter(
        item =>
          item['player_1_name'] === filterName ||
          item['player_2_name'] === filterName,
      );
      setFiteredGameHistoryData(tempGameHistoryData);
    }
  }, [filterName]);

  const displayedData =
    filteredGameHistoryData !== undefined
      ? filteredGameHistoryData
      : gameHistoryData;

  const handleLoadMore = () => {
    if (displayedData.length - renderedData > 5) {
      setRenderedData(prevState => prevState + 5);
    } else if (renderedData < displayedData.length) {
      setRenderedData(displayedData.length);
    } else {
      setRenderedData(5);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game History</Text>
      {gameHistoryData.length === 0 ? (
        <LoadingScreen />
      ) : (
        displayedData
          .sort((a, b) => {
            return b.timestamp - a.timestamp;
          })
          .slice(0, renderedData)
          .map((item, index) => {
            return (
              <GameCard
                gameData={item}
                leaderboardName={leaderboardName}
                key={index}
              />
            );
          })
      )}
      {displayedData.length > 3 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => handleLoadMore()}>
          <Text style={styles.showMoreButtonText}>
            {renderedData === displayedData.length ? '- less' : '+ more'}
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
    backgroundColor: colours.background,
    elevation: 7,
    padding: 10,
    marginVertical: 10,
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
