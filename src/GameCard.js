import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from './Colours';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const GameCard = props => {
  const game = props.gameData;
  const addedByCurrentUser = props.gameData.addedBy === auth().currentUser.uid;
  const [showOptions, setShowOptions] = useState();
  const [deleted, setDeleted] = useState(false);

  const [focusView, setFocusView] = useState(false);
  const [mediaUrl, setMediaUrl] = useState();
  const [mediaDimensions, setMediaDimensions] = useState({
    width: 50,
    height: 50,
  });

  const date = new Date(game.timestamp);
  const formatedDate =
    date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

  useEffect(() => {
    if (game.media !== undefined) {
      // Fetch the image URL from Firebase Storage
      const fetchMediaUrl = async () => {
        try {
          const url = await storage()
            .ref('/game_media/' + game.key)
            .getDownloadURL();
          setMediaUrl(url);
          Image.getSize(url, (width, height) => {
            setMediaDimensions({width: width, height: height});
          });
        } catch (error) {
          // Handle any errors that occur while fetching the image URL
          console.error('Error fetching image URL:', error);
        }
      };

      fetchMediaUrl();
    }
  }, [game.media, game.key]);

  const handleDeleteGame = () => {
    const gameRef = database().ref(
      '/' + props.leaderboardName + '/' + game.key + '/',
    );
    gameRef.remove();
    setDeleted(true);
    ToastAndroid.show('Game deleted', ToastAndroid.SHORT);
  };

  if (deleted) {
    return null;
  }

  return (
    <>
      {showOptions && (
        <View style={styles.gameOptionsContainer}>
          <TouchableOpacity
            style={styles.deleteGameButton}
            onPress={() => handleDeleteGame()}>
            <Text style={styles.deleteGameText}>Delete game</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableWithoutFeedback onPress={() => setFocusView(!focusView)}>
        <View style={styles.container}>
          <View style={styles.center_view}>
            <View style={styles.name_score_container} numberOfLines={1}>
              <Text style={styles.player_name}>{game.player_1_name}</Text>
              <Text style={styles.player_score}>
                {game.player_1_games_won}
                {game.player_1_games_won > game.player_2_games_won && ' 👑'}
              </Text>
            </View>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>-</Text>
            <View style={styles.name_score_container} numberOfLines={1}>
              <Text style={styles.player_name}>{game.player_2_name}</Text>
              <Text style={styles.player_score}>
                {game.player_2_games_won}
                {game.player_1_games_won < game.player_2_games_won && ' 👑'}
              </Text>
            </View>
          </View>
          {game.media !== undefined || game.note !== undefined ? (
            <View style={styles.media_container}>
              <View
                style={{
                  width: '100%',
                  height: 1,
                  backgroundColor: colors.accent,
                }}
              />
              <View
                style={{
                  display: 'flex',
                  flexDirection: focusView ? 'column' : 'row',
                  gap: 10,
                }}>
                {game.media !== undefined && mediaUrl !== undefined && (
                  <Image
                    style={[
                      {
                        aspectRatio:
                          mediaDimensions.width / mediaDimensions.height,
                      },
                      focusView ? styles.media_large : styles.media_small,
                    ]}
                    src={mediaUrl}
                  />
                )}
                {game.note !== undefined && (
                  <Text style={styles.note}>{game.note}</Text>
                )}
              </View>
            </View>
          ) : null}
          <Text style={styles.date} numberOfLines={1}>
            {formatedDate}
          </Text>
          {addedByCurrentUser && (
            <TouchableOpacity
              style={styles.options}
              onPress={() => setShowOptions(!showOptions)}>
              <View style={styles.optionsDot} />
              <View style={styles.optionsDot} />
              <View style={styles.optionsDot} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

export default GameCard;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.lighter_background,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  center_view: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
    gap: 10,
  },
  name_score_container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '47.5%',
  },
  player_name: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  player_score: {
    color: colors.text,
    fontSize: 18,
    textAlign: 'center',
  },
  date: {
    color: colors.light_text,
    position: 'absolute',
    top: 5,
    left: 5,
  },
  media_container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  media_small: {
    width: 50,
    height: 50,
    aspectRatio: 1,
  },
  media_large: {
    width: '100%',
    maxHeight: 500,
    alignSelf: 'center',
  },
  note: {
    color: colors.text,
    fontSize: 15,
  },
  options: {
    color: colors.light_text,
    position: 'absolute',
    top: 5,
    right: 5,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    padding: 10,
  },
  optionsDot: {
    width: 5,
    height: 5,
    backgroundColor: colors.light_text,
    borderRadius: 2.5,
  },
  gameOptionsContainer: {
    width: '100%',
    marginVertical: 10,
    backgroundColor: colors.lighter_background,
    borderRadius: 10,
  },
  deleteGameButton: {
    padding: 10,
    borderRadius: 10,
    width: '100%',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  deleteGameText: {
    color: colors.light_text,
    fontSize: 15,
  },
});
