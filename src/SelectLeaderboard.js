import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import colours from './Colours';
import database from '@react-native-firebase/database';
import {GAMBannerAd, BannerAdSize} from 'react-native-google-mobile-ads';

const SelectLeaderboard = ({navigation}) => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeaderboards, setFilteredLeaderboards] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const leaderboardsRef = database().ref('/');
      leaderboardsRef.once('value', snapshot => {
        const leaderboardArray = [];
        snapshot.forEach(childSnapshot => {
          leaderboardArray.push(childSnapshot.key);
        });
        setLeaderboards(leaderboardArray);
        setFilteredLeaderboards(leaderboardArray);
      });
    }, []),
  );

  const handleSearch = text => {
    setSearchQuery(text);
    const filtered = leaderboards.filter(leaderboard =>
      leaderboard.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredLeaderboards(filtered);
  };

  const onAdFailedToLoad = error => {
    console.log('error loading ad', error.message);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor={colours.text}
        onChangeText={handleSearch}
        value={searchQuery}
      />
      <View style={styles.leaderboardsContainer}>
        {filteredLeaderboards.slice(0, 3).map((leaderboard, index) => (
          <TouchableOpacity
            key={index}
            style={styles.game}
            onPress={() =>
              navigation.navigate('home', {leaderboard: leaderboard})
            }>
            <Text style={styles.gameText}>{leaderboard}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{borderWidth: 2, marginTop: 30}}>
        <GAMBannerAd
          unitId={'ca-app-pub-7497957931538271/8908530578'}
          sizes={['300x300']}
          onAdFailedToLoad={onAdFailedToLoad}
        />
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate('addLeaderboard')}
        style={styles.newLeaderboardContainer}>
        <Text style={styles.newLeaderboardButtonText}>
          + Create New Leaderboard
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SelectLeaderboard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colours.background,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
    padding: 10,
  },
  searchBar: {
    width: '100%',
    backgroundColor: colours.secondary,
    borderRadius: 10,
    color: colours.text,
    fontSize: 28,
    elevation: 7,
  },
  leaderboardsContainer: {
    width: '100%',
    backgroundColor: colours.secondary,
    borderRadius: 10,
    padding: 10,
    elevation: 7,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  game: {
    backgroundColor: colours.background,
    padding: 5,
    borderRadius: 5,
    elevation: 7,
  },
  gameText: {
    fontSize: 25,
    color: colours.text,
  },
  newLeaderboardContainer: {
    backgroundColor: colours.secondary,
    width: '100%',
    elevation: 7,
    borderRadius: 10,
    position: 'absolute',
    bottom: 10,
  },
  newLeaderboardButtonText: {
    fontSize: 28,
    color: colours.text,
    padding: 10,
    textAlign: 'center',
  },
});
