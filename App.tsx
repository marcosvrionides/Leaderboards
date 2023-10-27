import React from 'react';
import {PermissionsAndroid, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './src/Home';
import AddGame from './src/AddGame';
import SelectLeaderboard from './src/SelectLeaderboard';
import {GAMBannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import NewLeaderboardForm from './src/NewLeaderboardForm';
import messaging from '@react-native-firebase/messaging';
import colors from './src/Colours';

const App = () => {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

  // Register background handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log(remoteMessage);
  });

  const Stack = createNativeStackNavigator();

  const onAdFailedToLoad = error => {
    console.log('error loading ad', error.message);
  };

  return (
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
