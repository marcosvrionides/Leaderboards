import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colours from './Colours';
import database from '@react-native-firebase/database';

const SelectLeaderboard = ({navigation}) => {
  const [leaderboards, setLeaderboards] = useState([]);

  useEffect(() => {
    const leaderboardsRef = database().ref('/');
    setLeaderboards([]);
    leaderboardsRef.once('value', snapshot => {
      snapshot.forEach(childSnapshot => {
        setLeaderboards(prevState => [...prevState, childSnapshot.key]);
      });
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a game or{'\n'}Create a new one</Text>
      <View style={styles.leaderboardsContainer}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Text style={[styles.title, {width: 'auto'}]}>Leaderboards</Text>
          <TouchableOpacity>
            <Text style={styles.plusButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchContainer}
          placeholder="Search..."
          placeholderTextColor={colours.background}
        />
        <View style={styles.leaderboardsSubContainer}>
          {leaderboards.map((leaderboard, index) => (
            <TouchableOpacity
              key={index} // Add a unique key prop for each item in the list
              style={styles.game}
              onPress={() => navigation.navigate('home', {leaderboard: leaderboard})}>
              <Text style={styles.gameText}>{leaderboard}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
  title: {
    fontSize: 28,
    color: colours.text,
    fontFamily: 'times new roman',
    textAlign: 'left',
    width: '100%',
  },
  leaderboardsContainer: {
    width: '100%',
    flexGrow: 1,
    backgroundColor: colours.secondary,
    borderRadius: 10,
    elevation: 7,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  plusButtonText: {
    fontSize: 28,
    color: colours.text,
  },
  searchContainer: {
    backgroundColor: colours.primary,
    borderRadius: 10,
    color: colours.background,
    fontSize: 20,
  },
  leaderboardsSubContainer: {
    backgroundColor: colours.primary,
    flexGrow: 1,
    borderRadius: 10,
    padding: 10,
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
    fontSize: 20,
    color: colours.text,
  },
});
