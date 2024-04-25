import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import colors from './Colours';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import analytics from '@react-native-firebase/analytics';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import LottieView from 'lottie-react-native';

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

  const gameCardRef = useRef();
  const [shareMode, setShareMode] = useState(false);

  const date = new Date(game.timestamp);
  const formatedDate =
    date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

  const [liked, setLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(0);

  const animationRef = useRef(null);
  const isFirstRun = useRef(true);

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

  const handleDeleteGame = async () => {
    const gameRef = database().ref(
      '/' + props.leaderboardName + '/' + game.key + '/',
    );
    gameRef.remove();
    await analytics().logEvent('delete_game', {
      uid: auth().currentUser.uid,
      leaderboard: props.leaderboardName,
      game: game.key,
      timestamp: database.ServerValue.TIMESTAMP,
    });
    setDeleted(true);
    ToastAndroid.show('Game deleted', ToastAndroid.SHORT);
  };

  // share GameCard view
  const handleShare = () => {
    setFocusView(true);
    setShareMode(true);
  };

  useEffect(() => {
    if (focusView && shareMode) {
      gameCardRef.current.capture().then(uri => {
        Share.open({
          message:
            'Download Leaderboards on the Play Store: https://play.google.com/store/apps/details?id=com.backgammon_leaderboards',
          url: uri,
        })
          .then(res => {
            setShareMode(false);
          })
          .catch(err => {
            console.log(err);
            setShareMode(false);
          });
      });
    }
  }, [focusView, shareMode]);

  useEffect(() => {
    const checkUserLike = async () => {
      const gameLikesRef = database().ref(
        '/' + props.leaderboardName + '/' + game.key + '/likes',
      );

      try {
        const snapshot = await gameLikesRef
          .orderByValue()
          .equalTo(auth().currentUser.uid)
          .once('value');

        setLiked(snapshot.exists());
      } catch (error) {
        console.error('Error checking user like:', error);
      }
    };

    checkUserLike();
  }, []);

  useEffect(() => {
    const gameLikesRef = database().ref(
      '/' + props.leaderboardName + '/' + game.key + '/likes',
    );

    // Use the 'value' event to listen for changes in the likes
    const likesListener = gameLikesRef.on('value', snapshot => {
      // Get the count of likes
      const count = snapshot.numChildren();

      // Set the count to the state variable
      setLikedCount(count);
    });

    // Clean up the listener when the component unmounts
    return () => {
      gameLikesRef.off('value', likesListener);
    };
  }, [props.leaderboardName, game.key]);

  const handleLike = async () => {
    const gameLikesRef = database().ref(
      '/' + props.leaderboardName + '/' + game.key + '/likes',
    );
    const snapshot = await gameLikesRef
      .orderByValue()
      .equalTo(auth().currentUser.uid)
      .once('value');
    if (snapshot.exists()) {
      snapshot.forEach(childSnapshot => {
        childSnapshot.ref.remove();
        setLiked(false);
      });
    } else {
      gameLikesRef.push(auth().currentUser.uid);
      setLiked(true);
    }
  };

  useEffect(() => {
    if (isFirstRun.current) {
      if (!liked) {
        animationRef.current?.play(19, 19);
      } else {
        animationRef.current?.play(50, 50);
      }
      isFirstRun.current = false;
    } else if (liked) {
      animationRef.current.play(19, 50);
    } else if (!liked) {
      animationRef.current.play(0, 19);
    }
  }, [liked]);

  return (
    <>
      {deleted ? (
        <View style={styles.container}>
          <Text style={styles.deleteGameText}>
            Game deleted. Please refresh to update the scores.
          </Text>
        </View>
      ) : (
        <View>
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
                    {Number(game.player_1_games_won) >
                      Number(game.player_2_games_won) && ' 👑'}
                  </Text>
                </View>
                <Text style={{fontSize: 20, fontWeight: 'bold'}}>-</Text>
                <View style={styles.name_score_container} numberOfLines={1}>
                  <Text style={styles.player_name}>{game.player_2_name}</Text>
                  <Text style={styles.player_score}>
                    {game.player_2_games_won}
                    {Number(game.player_1_games_won) <
                      Number(game.player_2_games_won) && ' 👑'}
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
                    <ViewShot
                      ref={gameCardRef}
                      options={{
                        fileName: 'leaderboards-game-card',
                        format: 'jpg',
                        quality: 0.9,
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
                      {shareMode && game.media !== undefined && (
                        <View style={styles.watermark}>
                          <View
                            style={[
                              styles.center_view,
                              {
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                padding: 10,
                              },
                            ]}>
                            <View
                              style={styles.name_score_container}
                              numberOfLines={1}>
                              <Text
                                style={[styles.player_name, {color: 'white'}]}>
                                {game.player_1_name}
                              </Text>
                              <Text
                                style={[styles.player_score, {color: 'white'}]}>
                                {game.player_1_games_won}
                                {game.player_1_games_won >
                                  game.player_2_games_won && ' 👑'}
                              </Text>
                            </View>
                            <Text
                              style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: 'white',
                              }}>
                              -
                            </Text>
                            <View
                              style={styles.name_score_container}
                              numberOfLines={1}>
                              <Text
                                style={[styles.player_name, {color: 'white'}]}>
                                {game.player_2_name}
                              </Text>
                              <Text
                                style={[styles.player_score, {color: 'white'}]}>
                                {game.player_2_games_won}
                                {game.player_1_games_won <
                                  game.player_2_games_won && ' 👑'}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.5)',
                              paddingBottom: 10,
                            }}>
                            <Text style={styles.appName}>Leaderboards</Text>
                            <Text style={styles.appAuthor}>
                              by: Marcos Vrionides
                            </Text>
                          </View>
                        </View>
                      )}
                    </ViewShot>
                    {game.note !== undefined && (
                      <Text style={styles.note}>{game.note}</Text>
                    )}
                  </View>
                </View>
              ) : null}
              <View style={styles.bottomButtonsContainer}>
                <View style={styles.likesContainer}>
                  <TouchableWithoutFeedback onPress={() => handleLike()}>
                    <LottieView
                      style={styles.heartLottie}
                      ref={animationRef}
                      source={require('./assets/Animation.json')}
                      autoPlay={false}
                      loop={false}
                    />
                  </TouchableWithoutFeedback>
                  <Text style={styles.likeCountText}>{likedCount}</Text>
                </View>
                {game.media && (
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => handleShare()}>
                    <MaterialCommunityIcons
                      name={'share'}
                      size={20}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                )}
              </View>
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
        </View>
      )}
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
  bottomButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginHorizontal: 5,
    height: 30,
  },
  likeCountText: {
    alignSelf: 'center',
    color: colors.light_text,
  },
  shareButton: {justifyContent: 'center'},
  likesContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  heartLottie: {
    width: 50,
    height: 50,
    margin: -10,
  },
  watermark: {
    zIndex: 1,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    paddingBottom: 10,
    display: 'flex',
  },
  appName: {
    textAlign: 'center',
    color: colors.accent,
    fontSize: 40,
    fontWeight: 'bold',
  },
  appAuthor: {
    textAlign: 'center',
    color: colors.accent,
    fontSize: 20,
  },
});
