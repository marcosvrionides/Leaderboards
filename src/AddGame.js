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
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
import colours from './Colours';
import database from '@react-native-firebase/database';
import {ToastAndroid, FlatList} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import storage from '@react-native-firebase/storage';
import InAppReview from 'react-native-in-app-review';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import analytics from '@react-native-firebase/analytics';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

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
  const passwordInputRef = useRef(null);

  const [leaderboardPasswordInput, setLeaderboardPasswordInput] = useState('');
  const [leaderboardPassword, setLeaderboardPassword] = useState('');
  const [wrongPassword, setWrongPassword] = useState(false);

  const [invalidInput1, setInvalidInput1] = useState(false);
  const [invalidInput2, setInvalidInput2] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const leaderboard_ref = database().ref(leaderboard);
    const leaderboard_password_ref = database().ref(
      leaderboard + '/' + 'password',
    );

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

    leaderboard_password_ref.on('value', snapshot => {
      snapshot.forEach(childSnapshot => {
        setLeaderboardPassword(childSnapshot.val());
      });
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

  const enterPassword = () => {
    if (leaderboardPassword) {
      setModalVisible(true);
    } else {
      saveGame();
    }
  };

  const saveGame = async () => {
    if (
      player1Name.trim() === '' ||
      player2Name.trim() === '' ||
      player1GamesWon.trim() === '' ||
      player2GamesWon.trim() === ''
    ) {
      ToastAndroid.show('Please fill out all fields.', ToastAndroid.SHORT);
      return;
    }
    console.log(player1GamesWon, isNaN(player1GamesWon));
    console.log(player2GamesWon, isNaN(player2GamesWon));
    if (isNaN(player1GamesWon) || isNaN(player2GamesWon)) {
      ToastAndroid.show('Invalid input.', ToastAndroid.SHORT);
      return;
    }
    if (leaderboardPasswordInput !== leaderboardPassword) {
      ToastAndroid.show('Wrong password.', ToastAndroid.SHORT);
      setWrongPassword(true);
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
      addedBy: auth().currentUser.uid,
    });

    await analytics().logEvent('add_game', {
      uid: auth().currentUser.uid,
      leaderboard: leaderboard,
      game:
        player1Name.trim() +
        '(' +
        player1GamesWon.trim() +
        ')' +
        player2Name.trim() +
        '(' +
        player2GamesWon.trim() +
        ')',
      timestamp: database.ServerValue.TIMESTAMP,
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
    launchImageLibrary({mediaType: 'photo', saveToPhotos: true}, response => {
      if (!response.didCancel && !response.error && !response.customButton) {
        setGameMedia(response.assets[0].uri);
      }
    });
  };

  const handleOpenCamera = async () => {
    launchCamera({mediaType: 'photo', saveToPhotos: true}, response => {
      if (!response.didCancel && !response.error && !response.customButton) {
        setGameMedia(response.assets[0].uri);
      }
    });
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
      case 5:
        passwordInputRef.current.focus();
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

  const validateScore = (input, player) => {
    switch (player) {
      case 1:
        setPlayer1GamesWon(input);
        if (isNaN(input)) {
          setInvalidInput1(true);
        } else {
          setInvalidInput1(false);
        }
        break;
      case 2:
        setPlayer2GamesWon(input);
        if (isNaN(input)) {
          setInvalidInput2(true);
        } else {
          setInvalidInput2(false);
        }
        break;
    }
  };

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
                onPress={() => enterPassword()}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            )}
        </View>
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onShow={() => handleSwitchInputRef(5)}>
          <View style={styles.passwordModalContainer}>
            <TextInput
              ref={passwordInputRef}
              style={[
                styles.passwordInput,
                wrongPassword && {borderWidth: 2, borderColor: 'red'},
              ]}
              placeholder="Password"
              placeholderTextColor={colours.light_text}
              value={leaderboardPasswordInput}
              onChangeText={string => setLeaderboardPasswordInput(string)}
            />
            <View style={styles.passwordButtonsContainer}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.passwordButton, {borderColor: 'red'}]}>
                <Text style={{color: 'red'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveGame}
                style={styles.passwordButton}>
                <Text style={{color: colours.accent}}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View>
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
                style={[
                  styles.formInput,
                  invalidInput1 && {borderWidth: 2, borderColor: 'red'},
                ]}
                placeholder="Player 1 Games Won"
                placeholderTextColor={colours.light_text}
                value={player1GamesWon}
                onChangeText={number => validateScore(number, 1)}
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
                style={[
                  styles.formInput,
                  invalidInput2 && {borderWidth: 2, borderColor: 'red'},
                ]}
                placeholder="Player 2 Games Won"
                placeholderTextColor={colours.light_text}
                value={player2GamesWon}
                onChangeText={number => validateScore(number, 2)}
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
              <View style={styles.addPicture}>
                <TouchableOpacity
                  style={styles.mediaInput}
                  onPress={() => handleOpenMediaPicker()}>
                  <Text style={{color: colours.text}}>📎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.mediaInput}
                  onPress={() => handleOpenCamera()}>
                  <Text style={{color: colours.text}}>📷</Text>
                </TouchableOpacity>
              </View>
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  addPicture: {
    display: 'flex',
    flexDirection: 'row',
    height: 50,
    gap: 10,
  },
  noteInput: {
    color: colours.text,
    backgroundColor: colours.primary,
    borderRadius: 5,
    width: '100%',
  },
  mediaInput: {
    height: '100%',
    backgroundColor: colours.primary,
    borderRadius: 5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  passwordModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colours.translucent_background,
    padding: 10,
  },
  passwordInput: {
    color: colours.text,
    backgroundColor: colours.primary,
    borderRadius: 5,
    width: '100%',
    marginTop: 20,
    textAlign: 'center',
  },
  passwordButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    margin: 10,
  },
  passwordButton: {
    backgroundColor: colours.background,
    padding: 10,
    borderWidth: 2,
    borderColor: colours.accent,
    borderRadius: 10,
  },
});
