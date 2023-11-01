import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ToastAndroid,
  Modal,
  Alert,
  BackHandler,
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import colours from './Colours';
import database from '@react-native-firebase/database';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LoadingScreen from './LoadingScreen';
import auth from '@react-native-firebase/auth';

const SelectLeaderboard = ({navigation}) => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeaderboards, setFilteredLeaderboards] = useState([]);

  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [selectedLeaderboard, setSelectedLeaderboard] = useState({});
  const [passwordInput, setPasswordInput] = useState('');

  const [pinnedLeaderboards, setPinnedLeaderboards] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const searchInputRef = useRef(null);

  useEffect(() => {
    // read pins from firebase
    const usersPinsRef = database().ref(
      '/users/' + auth().currentUser.uid + '/pins/',
    );
    let tempPins = [];
    usersPinsRef.on('value', snapshot => {
      snapshot.forEach(childSnapshot => {
        tempPins.push(childSnapshot.key);
      });
    });
    setPinnedLeaderboards(tempPins);
  }, [refresh]);

  useFocusEffect(
    React.useCallback(() => {
      setShowPasswordInput(false);
      const leaderboardsRef = database().ref('/');
      leaderboardsRef.once('value', snapshot => {
        const leaderboardArray = [];
        snapshot.forEach(childSnapshot => {
          leaderboardArray.push(childSnapshot.key);
        });

        // Sort leaderboards
        const sortedLeaderboards = leaderboardArray.sort((a, b) => {
          const aIsPinned = pinnedLeaderboards.includes(a);
          const bIsPinned = pinnedLeaderboards.includes(b);
          if (aIsPinned && !bIsPinned) {
            return -1;
          }
          if (!aIsPinned && bIsPinned) {
            return 1;
          }
          return 0;
        });

        setLeaderboards(sortedLeaderboards);
        setFilteredLeaderboards(sortedLeaderboards);
      });
    }, [pinnedLeaderboards]),
  );

  const handleSearch = text => {
    setSearchQuery(text);
    const filtered = leaderboards.filter(leaderboard =>
      leaderboard.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredLeaderboards(filtered);
  };

  const handleOpenLeaderboard = leaderboard => {
    const leaderboardPasswordRef = database().ref(
      '/' + leaderboard + '/password',
    );
    leaderboardPasswordRef.on('value', snapshot => {
      snapshot.forEach(childSnapshot => {
        if (childSnapshot.val() !== '') {
          console.log('locked');
          setShowPasswordInput(true);
          setPasswordInput('');
          setSelectedLeaderboard({
            leaderboard: leaderboard,
            password: childSnapshot.val(),
          });
        } else {
          navigation.navigate('home', {leaderboard: leaderboard});
        }
      });
    });
  };

  const handleCheckPassword = () => {
    if (passwordInput === selectedLeaderboard.password) {
      navigation.navigate('home', {
        leaderboard: selectedLeaderboard.leaderboard,
      });
    } else {
      ToastAndroid.show('Wrong password.', ToastAndroid.SHORT);
    }
  };

  const [showPinPopup, setShowPinPopup] = useState(false);
  const handleLongPress = leaderboard => {
    setShowPinPopup(!showPinPopup);
    setSelectedLeaderboard(leaderboard);
  };

  const handlePinLeaderboard = () => {
    const pinnedLeaderboardsRef = database().ref(
      '/users/' + auth().currentUser.uid + '/pins/' + selectedLeaderboard,
    );
    if (pinnedLeaderboards.includes(selectedLeaderboard)) {
      pinnedLeaderboardsRef.remove();
    } else if (!pinnedLeaderboards.includes(selectedLeaderboard)) {
      pinnedLeaderboardsRef.set(true);
    }
    setSelectedLeaderboard('');
    setShowPinPopup(false);
    setRefresh(!refresh);
  };

  useEffect(() => {
    const handleNavigateBack = () => {
      Alert.alert('Hold on!', 'Are you sure you want to exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
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
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={showPinPopup}
          onRequestClose={() => setShowPinPopup(!showPinPopup)}>
          <View style={styles.pinPopup}>
            <Text style={styles.pinPopupText}>
              {pinnedLeaderboards.includes(selectedLeaderboard)
                ? 'Remove pin?'
                : 'Pin ' + selectedLeaderboard + '?'}
            </Text>
            <View style={styles.pinButtonsContainer}>
              <TouchableOpacity
                style={styles.pinButtons}
                onPress={() => handlePinLeaderboard()}>
                <Text style={styles.pinButtonsText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pinButtons}
                onPress={() => setShowPinPopup(false)}>
                <Text style={styles.pinButtonsText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {showPasswordInput && (
          <View style={styles.passwordFormContainer}>
            <TouchableOpacity
              onPress={() => {
                setShowPasswordInput(false);
                setPasswordInput('');
              }}
              style={styles.closePasswordFormContainer}>
              <View
                style={[styles.closeLine, {transform: [{rotate: '45deg'}]}]}
              />
              <View
                style={[styles.closeLine, {transform: [{rotate: '-45deg'}]}]}
              />
            </TouchableOpacity>
            <View style={styles.passwordInputContainer}>
              <Text style={{color: colours.text, fontSize: 20}}>
                Enter password for{' '}
                <Text style={styles.leaderboardName}>
                  {selectedLeaderboard.leaderboard}
                </Text>
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="password"
                  placeholderTextColor={colours.light_text}
                  onChangeText={text => setPasswordInput(text)}
                  value={passwordInput}
                />
                <TouchableOpacity
                  onPress={() => handleCheckPassword()}
                  style={styles.enterPasswordButtonContainer}>
                  <AntDesign
                    style={styles.enterPasswordButtonText}
                    name={'arrowright'}
                    color={colours.text}
                    size={18}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
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
          <Text style={styles.selectLeaderboardText}>
            Select a Leaderboard:
          </Text>
          {leaderboards.length === 0 ? (
            <LoadingScreen />
          ) : (
            filteredLeaderboards.slice(0, 7).map((leaderboard, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={styles.game}
                  onPress={() => handleOpenLeaderboard(leaderboard)}
                  onLongPress={() => handleLongPress(leaderboard)}>
                  <Text style={styles.gameText}>
                    {pinnedLeaderboards.includes(leaderboard) ? '📌 ' : ''}
                  </Text>
                  <Text style={styles.gameText} numberOfLines={2}>
                    {leaderboard}
                  </Text>
                </TouchableOpacity>
                {index !== filteredLeaderboards.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))
          )}
        </View>
        <Text style={colours.light_text}>
          (Long press to pin a leaderboard)
        </Text>
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
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
  },
  gameText: {
    fontSize: 20,
    color: colours.text,
    maxWidth: '90%',
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
  separator: {
    width: '95%',
    backgroundColor: colours.accent,
    height: 1,
    alignSelf: 'center',
    marginTop: 10,
  },
  passwordFormContainer: {
    backgroundColor: colours.background,
    zIndex: 1,
    position: 'absolute',
    bottom: 10,
    width: '100%',
    height: '100%',
    borderWidth: 2,
    paddingVertical: 10,
    borderRadius: 10,
  },
  passwordInputContainer: {
    position: 'absolute',
    top: '30%',
    width: '100%',
    alignItems: 'center',
    display: 'flex',
    gap: 10,
  },
  passwordInput: {
    flex: 0.95,
    color: colours.text,
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colours.text,
    borderRadius: 5,
  },
  enterPasswordButtonContainer: {
    backgroundColor: colours.primary,
    justifyContent: 'center',
    marginRight: 5,
    height: 40,
    width: 40,
    borderRadius: 50,
    elevation: 7,
  },
  enterPasswordButtonText: {
    textAlign: 'center',
  },
  leaderboardName: {
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: colours.accent,
  },
  closePasswordFormContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
    left: '50%',
    transform: [{translateX: -25}],
  },
  closeLine: {
    height: 2,
    width: '100%',
    backgroundColor: colours.text,
  },
  pinPopup: {
    backgroundColor: colours.lighter_background,
    borderWidth: 2,
    borderColor: colours.accent,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 25,
    width: '90%',
    marginHorizontal: 20,
    position: 'absolute',
    top: '50%',
    transform: [{translateY: -50}],
    elevation: 7,
  },
  pinPopupText: {
    color: colours.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  pinButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  pinButtons: {
    backgroundColor: colours.accent,
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  pinButtonsText: {
    color: colours.text,
    fontSize: 18,
  },
  selectLeaderboardText: {
    color: colours.light_text,
    fontSize: 15,
  },
});
