import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ToastAndroid,
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import colours from './Colours';
import database from '@react-native-firebase/database';
import {GAMBannerAd} from 'react-native-google-mobile-ads';
import AntDesign from 'react-native-vector-icons/AntDesign';

const SelectLeaderboard = ({navigation}) => {
  const [leaderboards, setLeaderboards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeaderboards, setFilteredLeaderboards] = useState([]);

  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [selecedLeaderboard, setSelectedLeaderboard] = useState({});
  const [passwordInput, setPasswordInput] = useState('');

  const searchInputRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      // setShowPasswordInput(false);
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

  const handleOpenLeaderboard = leaderboard => {
    const leaderboardPasswordRef = database().ref(
      '/' + leaderboard + '/password',
    );
    leaderboardPasswordRef.on('value', snapshot => {
      snapshot.forEach(childSnapshot => {
        if (childSnapshot.val() !== '') {
          console.log('locked');
          setShowPasswordInput(true);
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
    if (passwordInput === selecedLeaderboard.password) {
      navigation.navigate('home', {
        leaderboard: selecedLeaderboard.leaderboard,
      });
    } else {
      ToastAndroid.show('Wrong password.', ToastAndroid.SHORT);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}>
      <View style={styles.container}>
        {showPasswordInput && (
          <View style={styles.passwordInputContainer}>
            <View style={styles.passwordInputWrapper}>
              <Text style={{color: colours.text, fontSize: 20}}>
                Enter password for {selecedLeaderboard.leaderboard}
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  onChangeText={text => setPasswordInput(text)}
                  value={passwordInput}
                  style={styles.passwordInput}
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
            <TouchableOpacity
              onPress={() => setShowPasswordInput(false)}
              style={styles.closePasswordInputContainer}>
              <Text style={styles.closePasswordInputContainerText}>Close</Text>
            </TouchableOpacity>
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
          <Text style={styles.recentText}>
            {searchQuery.length > 0 ? 'Search:' : 'Recent:'}
          </Text>
          {filteredLeaderboards.slice(0, 3).map((leaderboard, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.game}
                onPress={() => handleOpenLeaderboard(leaderboard)}>
                <Text style={styles.gameText}>{leaderboard}</Text>
              </TouchableOpacity>
              {index !== filteredLeaderboards.length - 1 && (
                <View style={styles.separator} />
              )}
            </View>
          ))}
        </View>
        <View style={{marginTop: 30}}>
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
  separator: {
    width: '95%',
    backgroundColor: colours.accent,
    height: 1,
    alignSelf: 'center',
  },
  passwordInputContainer: {
    zIndex: 1,
    position: 'absolute',
    bottom: 10,
    width: '100%',
    height: '100%',
    backgroundColor: colours.background,
    borderWidth: 2,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  passwordInputWrapper: {
    width: '100%',
    alignItems: 'center',
    display: 'flex',
    gap: 10,
  },
  passwordInput: {
    flex: 0.95,
  },
  closePasswordInputContainer: {
    borderWidth: 2,
    width: 75,
    height: 75,
    borderRadius: 50,
    justifyContent: 'center',
  },
  closePasswordInputContainerText: {
    textAlign: 'center',
    color: colours.text,
    fontSize: 20,
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
    margin: 10,
    height: 40,
    width: 40,
    borderRadius: 10,
  },
  enterPasswordButtonText: {
    textAlign: 'center',
  },
});
