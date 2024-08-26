import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from './Colours';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

const LeaderboardChat = ({leaderboardName}) => {
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (sendingMessage) {
      handleSendMessage();
    }
  }, [sendingMessage]);

  const handleSendMessage = async () => {
    const game_chat_ref = database().ref('/' + leaderboardName + '/chat');
    const newMessageRef = game_chat_ref.push();
    await newMessageRef.set({
      message: newMessage,
      timestamp: database.ServerValue.TIMESTAMP,
      addedBy: auth().currentUser.uid,
    });
    setNewMessage('');
    setSendingMessage(false);
  };

  return (
    <View style={styles.container}>
      <Text>LeaderboardChat</Text>
      <View style={styles.newMessageContainer}>
        <TextInput
          style={styles.newMessageInput}
          placeholder="Message..."
          placeholderTextColor={colors.light_text}
          onChangeText={e => setNewMessage(e)}
          value={newMessage}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => setSendingMessage(true)}>
          <MaterialCommunityIcons
            name={'send'}
            size={25}
            color={colors.accent}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LeaderboardChat;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    height: '100%',
  },
  newMessageContainer: {
    position: 'absolute',
    bottom: 87.5,
    backgroundColor: colors.lighter_background,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
  newMessageInput: {
    backgroundColor: colors.secondary,
    flexGrow: 1,
    borderRadius: 50,
    padding: 10,
    margin: 5,
  },
  sendButton: {
    width: '10%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
