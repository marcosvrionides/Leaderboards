import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  TextInput,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import colours from './Colours';
import database from '@react-native-firebase/database';
import {ToastAndroid, FlatList} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AddGame = ({navigation, route}) => {
  const leaderboard = route.params.leaderboard;

  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player1GamesWon, setPlayer1GamesWon] = useState('');
  const [player2GamesWon, setPlayer2GamesWon] = useState('');
  const [playerNames, setPlayerNames] = useState([]);
  const [filteredPlayer1Names, setFilteredPlayer1Names] = useState([]);
  const [filteredPlayer2Names, setFilteredPlayer2Names] = useState([]);

  useEffect(() => {
    const leaderboard_ref = database().ref(leaderboard);

    leaderboard_ref.on('value', snapshot => {
      const temp_playerNames = [];

      snapshot.forEach(childSnapshot => {
        const player1Name = childSnapshot.val().player_1_name;
        const player2Name = childSnapshot.val().player_2_name;

        if (
          !temp_playerNames.includes(player1Name) &&
          player1Name !== undefined
        ) {
          temp_playerNames.push(player1Name);
        }

        if (
          !temp_playerNames.includes(player2Name) &&
          player2Name !== undefined
        ) {
          temp_playerNames.push(player2Name);
        }
      });

      setPlayerNames(temp_playerNames);
    });
  }, []);

  const filterPlayerNames = (player, inputText) => {
    if (inputText.length === 0) {
      player === 1 ? setFilteredPlayer1Names([]) : setFilteredPlayer2Names([]);
      return;
    }

    const filteredNames = playerNames.filter(
      name => name.toLowerCase().includes(inputText), // Convert each name to lowercase before comparison
    );

    if (player === 1) {
      setFilteredPlayer1Names(filteredNames);
      setFilteredPlayer2Names([]);
    } else {
      setFilteredPlayer2Names(filteredNames);
      setFilteredPlayer1Names([]);
    }
  };

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
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.backArrow}
            onPress={() =>
              navigation.navigate('home', {leaderboard: leaderboard})
            }>
            <MaterialCommunityIcons
              style={{textAlign: 'center'}}
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
            onChangeText={text => {
              setPlayer1Name(text);
              filterPlayerNames(1, text.toLocaleLowerCase());
            }}
          />

          {filteredPlayer1Names.length > 0 && (
            <FlatList
              keyboardShouldPersistTaps={'handled'}
              style={styles.searchedUsersList}
              data={filteredPlayer1Names.slice(0, 3)}
              keyExtractor={item => item}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.searchedUserContainer}
                  onPress={() => {
                    setPlayer1Name(item);
                    setFilteredPlayer1Names([]);
                  }}>
                  <Text style={styles.searchedUserText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <TextInput
            style={styles.formInput}
            placeholder="Player 2 Name"
            placeholderTextColor={colours.light_text}
            value={player2Name}
            onChangeText={text => {
              setPlayer2Name(text);
              filterPlayerNames(2, text.toLocaleLowerCase());
            }}
          />

          {filteredPlayer2Names.length > 0 && (
            <FlatList
              keyboardShouldPersistTaps={'handled'}
              style={styles.searchedUsersList}
              data={filteredPlayer2Names.slice(0, 3)}
              keyExtractor={item => item}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.searchedUserContainer}
                  onPress={() => {
                    setPlayer2Name(item);
                    setFilteredPlayer2Names([]);
                  }}>
                  <Text style={styles.searchedUserText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}

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
            onChangeText={number => setPlayer2GamesWon(number)}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButtonContainer}
          onPress={() => saveGame()}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
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
    left: 10,
    width: 50,
    height: '100%',
    justifyContent: 'center',
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
  searchedUsersList: {},
  searchedUserContainer: {
    backgroundColor: colours.secondary,
    marginBottom: 2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colours.light_text,
  },
  searchedUserText: {
    textAlign: 'center',
    color: colours.light_text,
    padding: 10,
  },
});
