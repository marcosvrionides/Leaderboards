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
  ScrollView,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import colours from './Colours';
import database from '@react-native-firebase/database';
import {ToastAndroid, FlatList} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as MediaPicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import InAppReview from 'react-native-in-app-review';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

const AddGame = ({navigation, route}) => {
  const leaderboard = route.params.leaderboard;

  const [numberOfPlayers, setNumberOfPlayers] = useState(2);
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [playersGamesWon, setPlayersGamesWon] = useState(['', '']);
  const [gameNote, setGameNote] = useState();
  const [gameMedia, setGameMedia] = useState();
  const [playerNamesSuggestions, setPlayerNamesSuggestions] = useState([]);
  const [filteredPlayersNames, setFilteredPlayersNames] = useState([[]]);

  const [leaderboardPasswordInput, setLeaderboardPasswordInput] = useState('');
  const [leaderboardPassword, setLeaderboardPassword] = useState('');
  const [wrongPassword, setWrongPassword] = useState(false);

  useEffect(() => {
    const leaderboard_ref = database().ref(leaderboard);
    const leaderboard_password_ref = database().ref(
      leaderboard + '/' + 'password',
    );

    leaderboard_ref.on('value', snapshot => {
      const temp_playerNamesSuggestions = [];

      snapshot.forEach(childSnapshot => {
        const player1Name = childSnapshot.val().player_1_name;
        const player2Name = childSnapshot.val().player_2_name;

        if (
          !temp_playerNamesSuggestions.includes(player1Name) &&
          player1Name !== undefined
        ) {
          temp_playerNamesSuggestions.push(player1Name);
        }

        if (
          !temp_playerNamesSuggestions.includes(player2Name) &&
          player2Name !== undefined
        ) {
          temp_playerNamesSuggestions.push(player2Name);
        }
      });

      setPlayerNamesSuggestions(temp_playerNamesSuggestions);
    });

    leaderboard_password_ref.on('value', snapshot => {
      snapshot.forEach(childSnapshot => {
        setLeaderboardPassword(childSnapshot.val());
      });
    });
  }, []);

  const filterPlayerNamesSuggestions = (player, inputText) => {
    if (inputText.length === 0) {
      temp = [...filteredPlayersNames];
      temp[player - 1] = [];
      setFilteredPlayersNames(temp);
      return;
    }

    const filteredNames = playerNamesSuggestions.filter(
      name => name.toLowerCase().includes(inputText), // Convert each name to lowercase before comparison
    );

    temp = [...filteredPlayersNames];
    temp[player - 1] = filteredNames;
    setFilteredPlayersNames(temp);
  };

  const saveGame = () => {
    if (leaderboardPasswordInput !== leaderboardPassword) {
      ToastAndroid.show('Wrong password.', ToastAndroid.SHORT);
      setWrongPassword(true);
      return;
    }
    for (let i = 0; i < playerNames.length; i++) {
      if (playerNames[i].trim() === '' || playersGamesWon[i].trim() === '') {
        ToastAndroid.show('Please fill out all fields.', ToastAndroid.SHORT);
        return;
      }
      if (!Number.isInteger(parseInt(playersGamesWon[i]))) {
        ToastAndroid.show('Invalid score input.', ToastAndroid.SHORT);
        return;
      }
    }

    const game_history_ref = database().ref('/' + leaderboard);
    const newGameRef = game_history_ref.push({
      player_names: playerNames,
      players_games_won: playersGamesWon,
      note: gameNote,
      media: gameMedia,
      timestamp: database.ServerValue.TIMESTAMP,
      addedBy: auth().currentUser.uid,
    });

    if (gameMedia !== undefined) {
      uploadMedia(newGameRef.key);
    }

    const pinnedLeaderboardsRef = database().ref(
      '/users/' + auth().currentUser.uid + '/pins/' + leaderboard,
    );
    pinnedLeaderboardsRef.set(true);

    messaging()
      .subscribeToTopic(leaderboard)
      .then(() => console.log('subscribed to topic "' + leaderboard + '"'));

    ToastAndroid.show('Game Saved.', ToastAndroid.SHORT);

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

  const handleSuggestionPress = (suggestion, player) => {
    temp = [...playerNames];
    temp[player - 1] = suggestion;
    setPlayerNames(temp);
    setFilteredPlayersNames([]);
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

  const players = [];
  for (let player = 1; player <= numberOfPlayers; player++) {
    players.push(
      <View key={player}>
        <Text>Player {player}:</Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TextInput
            style={styles.formInput}
            placeholder="Name"
            placeholderTextColor={colours.light_text}
            value={playerNames[player - 1]}
            onChangeText={text => {
              temp = [...playerNames];
              temp[player - 1] = text;
              setPlayerNames(temp);
              filterPlayerNamesSuggestions(player, text.toLocaleLowerCase());
            }}
            maxLength={30}
          />
          <TextInput
            style={styles.formInput}
            placeholder="Games Won"
            placeholderTextColor={colours.light_text}
            value={playersGamesWon[player - 1]}
            onChangeText={number => {
              temp = [...playersGamesWon];
              temp[player - 1] = number;
              setPlayersGamesWon(temp);
            }}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
        {filteredPlayersNames[player - 1] !== undefined &&
          filteredPlayersNames[player - 1].length > 0 && (
            <>
              <Text style={styles.suggestionsTitleText}>Suggestions:</Text>
              <FlatList
                keyboardShouldPersistTaps={'handled'}
                style={styles.searchedUsersList}
                data={filteredPlayersNames[player - 1].slice(0, 3)}
                keyExtractor={item => item}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.searchedUserContainer}
                    onPress={() => {
                      handleSuggestionPress(item, player);
                    }}>
                    <Text style={styles.searchedUserText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </>
          )}
      </View>,
    );
  }

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
          {playerNames.length > 1 && playersGamesWon.length > 1 && (
            <TouchableOpacity
              style={styles.saveButtonContainer}
              onPress={() => saveGame()}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps={'handled'}>
          <View style={{height: 50}} />

          <View style={styles.formContainer}>
            {players}

            <TouchableOpacity
              onPress={() => {
                setNumberOfPlayers(numberOfPlayers + 1);
                temp = [...playerNames];
                temp1 = [...playersGamesWon];
                temp.push('');
                temp1.push('');
                setPlayerNames(temp);
                setPlayersGamesWon(temp1);
              }}>
              <Text>Add player</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setNumberOfPlayers(numberOfPlayers - 1);
                temp = [...playerNames];
                temp1 = [...playersGamesWon];
                temp.pop();
                temp1.pop();
                setPlayerNames(temp);
                setPlayersGamesWon(temp1);
              }}>
              <Text>Remove player</Text>
            </TouchableOpacity>

            <View style={styles.addExtraContainer}>
              <TextInput
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
            {leaderboardPassword && (
              <TextInput
                style={[
                  styles.passwordInput,
                  wrongPassword && {borderWidth: 2, borderColor: 'red'},
                ]}
                placeholder="Password"
                placeholderTextColor={colours.light_text}
                value={leaderboardPasswordInput}
                onChangeText={string => setLeaderboardPasswordInput(string)}
              />
            )}
          </View>
        </ScrollView>
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
  searchedUsersList: {
    paddingBottom: 10,
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
  crown: {
    position: 'absolute',
    zIndex: 1,
    top: 10,
    left: 0,
  },
  passwordInput: {
    color: colours.text,
    backgroundColor: colours.primary,
    borderRadius: 5,
    width: '100%',
    marginTop: 20,
    textAlign: 'center',
  },
  suggestionsTitleText: {
    color: colours.light_text,
    fontSize: 13,
    padding: 5,
  },
});
