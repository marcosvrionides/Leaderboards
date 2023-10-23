import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './src/Home';
import AddGame from './src/AddGame';
import SelectLeaderboard from './src/SelectLeaderboard';
import {GAMBannerAd, BannerAdSize} from 'react-native-google-mobile-ads';
import NewLeaderboardForm from './src/NewLeaderboardForm';
import VersionCheck from 'react-native-version-check';

const App = () => {
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

export default App;
