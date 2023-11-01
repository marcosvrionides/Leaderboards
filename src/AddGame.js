import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  TextInput,
  Image,
  BackHandler,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import colours from './Colours';
import database from '@react-native-firebase/database';
import {ToastAndroid, FlatList} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as MediaPicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {BlurView} from '@react-native-community/blur';
import SQLiteStorage from 'react-native-sqlite-storage';
import InAppReview from 'react-native-in-app-review';

const AddGame = ({navigation, route}) => {
  const leaderboard = route.params.leaderboard;

  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player1GamesWon, setPlayer1GamesWon] = useState('');
  const [player2GamesWon, setPlayer2GamesWon] = useState('');
  const [gameNote, setGameNote] = useState();
  const [gameMedia, setGameMedia] = useState();
  const [playerNames, setPlayerNames] = useState([]);
  const [filteredPlayer1Names, setFilteredPlayer1Names] = useState([]);
  const [filteredPlayer2Names, setFilteredPlayer2Names] = useState([]);

  const player1NameInputRef = useRef(null);
  const player2NameInputRef = useRef(null);
  const player1WinsInputRef = useRef(null);
  const player2WinsInputRef = useRef(null);
  const noteInputRef = useRef(null);

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
    const newGameRef = game_history_ref.push({
      player_1_name: player1Name.trim(),
      player_2_name: player2Name.trim(),
      player_1_games_won: player1GamesWon.trim(),
      player_2_games_won: player2GamesWon.trim(),
      note: gameNote,
      media: gameMedia,
      timestamp: database.ServerValue.TIMESTAMP,
    });

    if (gameMedia !== undefined) {
      uploadMedia(newGameRef.key);
    }

    // Open or create the database
    const db = SQLiteStorage.openDatabase(
      {
        name: 'myDatabase.db',
        location: 'default',
      },
      () => {
        return;
      },
      error => {
        console.error('Error opening database:', error);
      },
    );

    // Create a table
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS pinned_leaderboards (id INTEGER PRIMARY KEY AUTOINCREMENT, leaderboard_name TEXT)',
        [],
        () => {
          return;
        },
        error => {
          console.error('Error creating table:', error);
        },
      );
    });

    // Insert data into the table
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO pinned_leaderboards (leaderboard_name) VALUES (?)',
        [leaderboard],
        () => {
          return;
        },
        error => {
          console.error('Error inserting data:', error);
        },
      );
    });

    ToastAndroid.show('Game Saved.', ToastAndroid.SHORT);

    if (InAppReview.isAvailable()) {
      InAppReview.RequestInAppReview()
        .then(hasFlowFinishedSuccessfully => {
          // when return true in android it means user finished or close review flow
          console.log('InAppReview in android', hasFlowFinishedSuccessfully);

          // when return true in ios it means review flow lanuched to user.
          console.log(
            'InAppReview in ios has launched successfully',
            hasFlowFinishedSuccessfully,
          );
          if (hasFlowFinishedSuccessfully) {
            navigation.navigate('home', {leaderboard: leaderboard});
            return;
          }
        })
        .catch(error => {
          console.log(error);
        });
    }

    navigation.navigate('home', {leaderboard: leaderboard});
  };

  const uploadMedia = async key => {
    const reference = storage().ref('/game_media/' + key);
    await reference.putFile(gameMedia);
  };

  const handleOpenMediaPicker = async () => {
    MediaPicker.launchCamera(
      {
        mediaType: 'mixed',
      },
      response => {
        if (!response.didCancel && !response.error && !response.customButton) {
          setGameMedia(response.assets[0].uri);
        }
      },
    );
  };

  const handleSuggestionPress = (suggestion, ref) => {
    switch (ref) {
      case 1:
        setPlayer1Name(suggestion);
        setFilteredPlayer1Names([]);
        break;
      case 2:
        setPlayer2Name(suggestion);
        setFilteredPlayer2Names([]);
        break;
    }
    handleSwitchInputRef(ref);
  };

  const handleSwitchInputRef = ref => {
    switch (ref) {
      case 1:
        player1WinsInputRef.current.focus();
        break;
      case 2:
        player2WinsInputRef.current.focus();
        break;
      case 3:
        player2NameInputRef.current.focus();
        break;
      case 4:
        noteInputRef.current.focus();
        break;
    }
  };

  useEffect(() => {
    const handleNavigateBack = () => {
      navigation.navigate('home', {leaderboard: leaderboard});
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleNavigateBack,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}>
      <View
        style={{backgroundColor: colours.lighter_background, height: '100%'}}>
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
          {player1Name !== '' &&
            player2Name !== '' &&
            player1GamesWon !== '' &&
            player2GamesWon !== '' && (
              <TouchableOpacity
                style={styles.saveButtonContainer}
                onPress={() => saveGame()}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            )}
        </View>
        <View style={styles.container}>
          <View style={{height: 50}} />
          <View style={styles.formContainer}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              {player1GamesWon > player2GamesWon && (
                <Text style={styles.crown}>👑</Text>
              )}
              <TextInput
                ref={player1NameInputRef}
                style={styles.formInput}
                placeholder="Player 1 Name"
                placeholderTextColor={colours.light_text}
                value={player1Name}
                onChangeText={text => {
                  setPlayer1Name(text);
                  filterPlayerNames(1, text.toLocaleLowerCase());
                }}
                onSubmitEditing={() => {
                  handleSwitchInputRef(1);
                  setFilteredPlayer1Names([]);
                }}
                maxLength={30}
              />
              <TextInput
                ref={player1WinsInputRef}
                style={styles.formInput}
                placeholder="Player 1 Games Won"
                placeholderTextColor={colours.light_text}
                value={player1GamesWon}
                onChangeText={number => setPlayer1GamesWon(number)}
                keyboardType="numeric"
                onSubmitEditing={() => handleSwitchInputRef(3)}
                maxLength={4}
              />
            </View>

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
                      handleSuggestionPress(item, 1);
                    }}>
                    <Text style={styles.searchedUserText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <Text style={styles.vsText}>VS</Text>

            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              {player2GamesWon > player1GamesWon && (
                <Text style={styles.crown}>👑</Text>
              )}
              <TextInput
                ref={player2NameInputRef}
                style={styles.formInput}
                placeholder="Player 2 Name"
                placeholderTextColor={colours.light_text}
                value={player2Name}
                onChangeText={text => {
                  setPlayer2Name(text);
                  filterPlayerNames(2, text.toLocaleLowerCase());
                }}
                onSubmitEditing={() => {
                  handleSwitchInputRef(2);
                  setFilteredPlayer2Names([]);
                }}
                maxLength={30}
              />
              <TextInput
                ref={player2WinsInputRef}
                style={styles.formInput}
                placeholder="Player 2 Games Won"
                placeholderTextColor={colours.light_text}
                value={player2GamesWon}
                onChangeText={number => setPlayer2GamesWon(number)}
                keyboardType="numeric"
                onSubmitEditing={() => handleSwitchInputRef(4)}
                maxLength={4}
              />
            </View>

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
                      handleSuggestionPress(item, 2);
                    }}>
                    <Text style={styles.searchedUserText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <View style={styles.addExtraContainer}>
              <TextInput
                ref={noteInputRef}
                style={styles.noteInput}
                placeholder="Add a note"
                placeholderTextColor={colours.light_text}
                value={gameNote}
                onChangeText={string => setGameNote(string)}
                maxLength={300}
              />
              <TouchableOpacity
                style={styles.mediaInput}
                onPress={() => handleOpenMediaPicker()}>
                <Text style={{color: colours.text}}>Pic? 📷</Text>
              </TouchableOpacity>
            </View>
            {gameMedia !== undefined && (
              <View style={styles.mediaContainer}>
                <TouchableOpacity
                  onPress={() => setGameMedia()}
                  style={styles.removeMediaButton}>
                  <Text style={styles.removeMediaButtonText}>X</Text>
                </TouchableOpacity>
                <Image style={styles.mediaPreview} src={gameMedia} />
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AddGame;

const styles = StyleSheet.create({
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: colours.translucent_background,
    zIndex: 2,
    width: '100%',
    position: 'absolute',
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  title: {
    fontSize: 20,
    color: colours.text,
    padding: 10,
  },
  backArrow: {
    justifyContent: 'center',
  },
  saveButtonContainer: {
    backgroundColor: colours.primary,
    borderRadius: 10,
  },
  saveButtonText: {
    fontSize: 20,
    color: colours.text,
    textAlign: 'center',
    padding: 5,
    paddingHorizontal: 30,
  },
  formContainer: {
    backgroundColor: colours.lighter_background,
    padding: 10,
  },
  formInput: {
    backgroundColor: colours.primary,
    color: colours.text,
    marginVertical: 10,
    padding: 10,
    borderRadius: 5,
    flex: 0.49,
  },
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
  addExtraContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  noteInput: {
    color: colours.text,
    backgroundColor: colours.primary,
    borderRadius: 5,
    width: '75%',
  },
  mediaInput: {
    padding: 10,
    backgroundColor: colours.primary,
    borderRadius: 5,
    flex: 1,
    borderWidth: 2,
    borderColor: colours.text,
  },
  mediaContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  mediaPreview: {
    width: '50%',
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: colours.text,
    marginTop: 10,
  },
  removeMediaButton: {
    height: 50,
    width: 50,
    padding: 10,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colours.accent,
  },
  removeMediaButtonText: {
    color: colours.accent,
    fontSize: 20,
    textAlign: 'center',
  },
  vsText: {
    textAlign: 'center',
    color: colours.accent,
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  crown: {
    position: 'absolute',
    zIndex: 1,
    top: 10,
    left: 0,
  },
});
