import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from './Colours';
import storage from '@react-native-firebase/storage';

const GameCard = props => {
  const game = props.gameData;

  const [focusView, setFocusView] = useState(false);
  const [mediaUrl, setMediaUrl] = useState();

  const date = new Date(game.timestamp);
  const formatedDate =
    date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

  async () => {
    if (game.media !== undefined) {
      // Fetch the image URL from Firebase Storage
      try {
        const url = await storage()
          .ref('game_media/' + game.key)
          .getDownloadURL();
        setMediaUrl(url);
      } catch (error) {
        // Handle any errors that occur while fetching the image URL
        console.error('Error fetching image URL:', error);
      }
    }
  };

  return (
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
              style={{width: '100%', height: 2, backgroundColor: colors.text}}
            />
            {game.note !== undefined && (
              <Text style={styles.note}>{game.note}</Text>
            )}
            {game.media !== undefined && (
              <Image
                style={focusView ? styles.media_large : styles.media_small}
                src={mediaUrl}
              />
            )}
          </View>
        ) : null}
        <Text style={styles.date} numberOfLines={1}>
          {formatedDate}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default GameCard;

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: colors.text,
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
  },
  player_name: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 20,
  },
  player_score: {
    color: colors.text,
    fontSize: 18,
  },
  date: {
    color: colors.text,
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
    borderWidth: 2,
    borderColor: colors.text,
  },
  media_large: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: colors.text,
  },
  note: {
    color: colors.text,
    fontSize: 15,
  },
});