import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import colours from './Colours';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import database from '@react-native-firebase/database';

const NewLeaderboardForm = ({navigation}) => {
  const [leaderboardName, setLeaderboardName] = useState('');
  const [leaderboardPassword, setLeaderboardPassword] = useState('');

  const saveLeaderboard = () => {
    const databaseRef = database().ref('/' + leaderboardName+'/password');
    databaseRef.push(leaderboardPassword)
    navigation.navigate('home', {leaderboard: leaderboardName})
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('selectLeaderboard')}>
          <MaterialCommunityIcons
            name={'arrow-left'}
            size={28}
            color={colours.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>New Leaderboard</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.formInput}
          placeholder="Leaderboard Name"
          placeholderTextColor={colours.light_text}
          value={leaderboardName}
          onChangeText={text => setLeaderboardName(text)}
        />

        <TextInput
          style={styles.formInput}
          placeholder="Leaderboard Password"
          placeholderTextColor={colours.light_text}
          value={leaderboardPassword}
          onChangeText={number => setLeaderboardPassword(number)}
        />
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
    padding: 10,
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontFamily: 'times new roman',
    fontSize: 30,
    fontWeight: 'bold',
    color: colours.text,
    padding: 10,
  },
  formContainer: {
    backgroundColor: colours.secondary,
    position: 'absolute',
    top: '20%',
    width: '95%',
    margin: 20,
    borderRadius: 10,
    elevation: 7,
    padding: 10,
  },
  formInput: {
    backgroundColor: colours.background,
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
    color: colours.background,
    textAlign: 'center',
    padding: 15,
    paddingHorizontal: 30,
  },
});
