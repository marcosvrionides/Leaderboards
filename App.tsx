import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './src/Home';
import AddGame from './src/AddGame';
import SelectLeaderboard from './src/SelectLeaderboard';
import {GAMBannerAd, BannerAdSize} from 'react-native-google-mobile-ads';

const App = () => {
  const Stack = createNativeStackNavigator();

  const onAdFailedToLoad = error => {
    console.log('error loading ad', error.message);
  };

  return (
    <>
      <GAMBannerAd
        unitId={'ca-app-pub-7497957931538271/8908530578'}
        sizes={[BannerAdSize.FULL_BANNER]}
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
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
