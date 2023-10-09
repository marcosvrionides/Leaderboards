import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
  Switch,
} from 'react-native';
import React, {useState} from 'react';
import colours from './Colours';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import database from '@react-native-firebase/database';

const NewLeaderboardForm = ({navigation}) => {
  const [leaderboardName, setLeaderboardName] = useState('');
  const [leaderboardPassword, setLeaderboardPassword] = useState('');
  const [nameInUse, setNameInUse] = useState(false);
  const [lockLeaderboard, setLockLeaderboard] = useState(false);

  const handleChangeLeaderboardName = text => {
    setLeaderboardName(text);
    const databaseRef = database().ref('/' + text);
    databaseRef.once('value', snapshot => {
      if (snapshot.exists()) {
        setNameInUse(true);
      } else {
        setNameInUse(false);
      }
    });
  };

  const saveLeaderboard = () => {
    if (nameInUse) {
      ToastAndroid.show('This name is already in use.', ToastAndroid.SHORT);
      return;
    }
    if (lockLeaderboard && leaderboardPassword.trim() === '') {
      ToastAndroid.show('Please enter a password', ToastAndroid.SHORT);
      return;
    }
    const databaseRef = database().ref('/' + leaderboardName + '/password');
    databaseRef.push(leaderboardPassword);
    navigation.navigate('home', {leaderboard: leaderboardName});
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => navigation.navigate('selectLeaderboard')}>
          <MaterialCommunityIcons
            name={'arrow-left'}
            size={20}
            color={colours.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>New Leaderboard</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={[
            styles.formInput,
            nameInUse && styles.errorBorder, // Apply error border style conditionally
          ]}
          placeholder="Leaderboard Name"
          placeholderTextColor={colours.light_text}
          value={leaderboardName}
          onChangeText={text => handleChangeLeaderboardName(text)}
        />

        <View style={styles.lockLeaderboardContainer}>
          <Text style={styles.lockLeaderboardText}>Require Password?</Text>
          <Switch
            onValueChange={() => setLockLeaderboard(!lockLeaderboard)}
            value={lockLeaderboard}
            thumbColor={lockLeaderboard ? colours.primary : 'black'}
          />
        </View>
        {lockLeaderboard && (
          <TextInput
            style={styles.formInput}
            placeholder="Leaderboard Password"
            placeholderTextColor={colours.light_text}
            value={leaderboardPassword}
            onChangeText={number => setLeaderboardPassword(number)}
          />
        )}
      </View>
      <TouchableOpacity
        style={styles.saveButtonContainer}
        onPress={() => saveLeaderboard()}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

export default NewLeaderboardForm;

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
  errorBorder: {
    borderWidth: 2,
    borderColor: 'red',
  },
  lockLeaderboardContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockLeaderboardText: {
    color: colours.text,
  },
});
