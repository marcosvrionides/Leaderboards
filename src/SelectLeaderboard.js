import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import colours from './Colours';
import database from '@react-native-firebase/database';
import {GAMBannerAd} from 'react-native-google-mobile-ads';
import AntDesign from 'react-native-vector-icons/AntDesign';

const SelectLeaderboard = ({navigation}) => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeaderboards, setFilteredLeaderboards] = useState([]);

  const searchInputRef = useRef(null);

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
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}>
      <View style={styles.container}>
        <View style={styles.leaderboardsContainer}>
          <TouchableWithoutFeedback
            onPress={() => searchInputRef.current.focus()}>
            <View style={styles.searchBar}>
              <AntDesign
                name={'search1'}
                color={colours.light_text}
                size={18}
              />
              <TextInput
                ref={searchInputRef}
                placeholder={'Search...'}
                placeholderTextColor={colours.light_text}
                fontSize={18}
                onChangeText={handleSearch}
                value={searchQuery}
              />
            </View>
          </TouchableWithoutFeedback>
          <Text style={styles.recentText}>
            {searchQuery.length > 0 ? 'Search:' : 'Recent:'}
          </Text>
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
          <Text style={styles.newLeaderboardButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
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
    backgroundColor: colours.primary,
    borderRadius: 10,
    color: colours.text,
    fontSize: 28,
    elevation: 7,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardsContainer: {
    width: '100%',
    backgroundColor: colours.lighter_background,
    borderRadius: 10,
    padding: 10,
    elevation: 7,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  game: {
    padding: 5,
  },
  gameText: {
    fontSize: 20,
    color: colours.text,
  },
  newLeaderboardContainer: {
    backgroundColor: colours.accent,
    width: '20%',
    aspectRatio: 1,
    elevation: 7,
    borderRadius: 50,
    position: 'absolute',
    bottom: 20,
    right: 20,
    justifyContent: 'center',
  },
  newLeaderboardButtonText: {
    fontSize: 25,
    color: colours.text,
    padding: 10,
    textAlign: 'center',
  },
  recentText: {
    fontSize: 18,
    marginTop: 15,
    color: colours.text,
  },
});
