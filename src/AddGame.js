import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import colours from './Colours';
import database from '@react-native-firebase/database';
import {ToastAndroid} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AddGame = ({navigation, route}) => {
  const leaderboard = route.params.leaderboard;

  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player1GamesWon, setPlayer1GamesWon] = useState('');
  const [player2GamesWon, setPlayer2GamesWon] = useState('');

  const saveGame = () => {
    if (
      player1Name.trim() === '' ||
      player2Name.trim() === '' ||
      player1GamesWon.trim() === '' ||
      player2GamesWon.trim() === ''
    ) {
      ToastAndroid.show('Please fill out all fields.', ToastAndroid.SHORT);
      return;
    }
    if (
      !(
        Number.isInteger(player1GamesWon) === false ||
        Number.isInteger(player2GamesWon) === false
      )
    ) {
      ToastAndroid.show('Invalid input.', ToastAndroid.SHORT);
      return;
    }
    const game_history_ref = database().ref('/' + leaderboard);
    game_history_ref.push({
      player_1_name: player1Name,
      player_2_name: player2Name,
      player_1_games_won: player1GamesWon,
      player_2_games_won: player2GamesWon,
      timestamp: database.ServerValue.TIMESTAMP,
    });
    ToastAndroid.show('Game Saved.', ToastAndroid.SHORT);
    navigation.navigate('home', {leaderboard: leaderboard});
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() =>
            navigation.navigate('home', {leaderboard: leaderboard})
          }>
          <MaterialCommunityIcons
            name={'arrow-left'}
            size={20}
            color={colours.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Game Details Form</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.formInput}
          placeholder="Player 1 Name"
          placeholderTextColor={colours.light_text}
          value={player1Name}
          onChangeText={text => setPlayer1Name(text)}
        />

        <TextInput
          style={styles.formInput}
          placeholder="Player 2 Name"
          placeholderTextColor={colours.light_text}
          value={player2Name}
          onChangeText={number => setPlayer2Name(number)}
        />

        <TextInput
          style={styles.formInput}
          placeholder="Player 1 Games Won"
          placeholderTextColor={colours.light_text}
          value={player1GamesWon}
          onChangeText={number => setPlayer1GamesWon(number)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.formInput}
          placeholder="Player 2 Games Won"
          placeholderTextColor={colours.light_text}
          value={player2GamesWon}
          onChangeText={text => setPlayer2GamesWon(text)}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        style={styles.saveButtonContainer}
        onPress={() => saveGame()}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddGame;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colours.background,
    height: '100%',
  },

  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    position: 'relative',
    backgroundColor: colours.background,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    color: colours.text,
    padding: 10,
  },
  backArrow: {
    position: 'absolute',
    left: 20,
  },

  formContainer: {
    backgroundColor: colours.lighter_background,
    position: 'absolute',
    top: '20%',
    width: '90%',
    margin: 20,
    borderRadius: 10,
    elevation: 7,
    padding: 10,
  },

  formInput: {
    backgroundColor: colours.primary,
    color: colours.text,
    marginVertical: 10,
    padding: 10,
    borderRadius: 5,
  },

  saveButtonContainer: {
    backgroundColor: colours.primary,
    borderRadius: 10,
    elevation: 7,
    position: 'absolute',
    bottom: 10,
    right: 10,
  },

  saveButtonText: {
    fontSize: 20,
    color: colours.text,
    textAlign: 'center',
    padding: 15,
    paddingHorizontal: 30,
  },
});
