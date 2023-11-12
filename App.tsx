import React, {useEffect, useState} from 'react';
import {Alert, PermissionsAndroid, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './src/Home';
import AddGame from './src/AddGame';
import SelectLeaderboard from './src/SelectLeaderboard';
import {GAMBannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import NewLeaderboardForm from './src/NewLeaderboardForm';
import messaging from '@react-native-firebase/messaging';
import colors from './src/Colours';
import auth from '@react-native-firebase/auth';
import LoadingScreen from './src/LoadingScreen';
import notifee, {AndroidImportance} from '@notifee/react-native';

const App = () => {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

  const [isLoading, setIsLoading] = useState(true);

  // Register background handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
    const {data} = remoteMessage;

    // Create a channel
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      vibration: true,
    });

    // Display a notification
    await notifee.displayNotification({
      title: `${data.player_1} (${data.player_1_wins}) - ${data.player_2} (${data.player_2_wins})`,
      subtitle: data.leaderboard,
      android: {
        channelId,
        // pressAction is needed if you want the notification to open the app when pressed
        pressAction: {
          id: 'default',
        },
      },
    });
  });

  // Foreground message handler
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Message handled in the foreground!', remoteMessage);
      const {data} = remoteMessage;

      // Create a channel
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
        vibration: true,
      });

      // Display a notification
      await notifee.displayNotification({
        title: `${data.player_1} (${data.player_1_wins}) - ${data.player_2} (${data.player_2_wins})`,
        subtitle: data.leaderboard,
        android: {
          channelId,
          // pressAction is needed if you want the notification to open the app when pressed
          pressAction: {
            id: 'default',
          },
        },
      });
    });

    return unsubscribe;
  }, []);

  const Stack = createNativeStackNavigator();

  const onAdFailedToLoad = error => {
    console.log('error loading ad', error.message);
  };

  const handleGuestLogin = async () => {
    auth()
      .signInAnonymously()
      .then(() => setIsLoading(false))
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(() => {
    handleGuestLogin();
  }, []);

  return isLoading ? (
    <LoadingScreen />
  ) : (
    <>
      <GAMBannerAd
        unitId={'ca-app-pub-7497957931538271/9931339721'}
        sizes={[BannerAdSize.ANCHORED_ADAPTIVE_BANNER]}
        onAdFailedToLoad={onAdFailedToLoad}
      />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="selectLeaderboard"
            component={SelectLeaderboard}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="home"
            component={Home}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="addGame"
            component={AddGame}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="addLeaderboard"
            component={NewLeaderboardForm}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  updateContainer: {
    height: 100,
    backgroundColor: colors.background,
    marginTop: 10,
    elevation: 7,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});

export default App;
