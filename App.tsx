import React, {useEffect, useState} from 'react';
import {
  PermissionsAndroid,
  AppRegistry,
  View,
  Text,
  StyleSheet,
  Button,
  Linking,
} from 'react-native';
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
  const [updateAvailable, setUpdateAvailable] = useState(false);

  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

  // Register background handler
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    setUpdateAvailable(true);
  });

  const Stack = createNativeStackNavigator();

  const onAdFailedToLoad = error => {
    console.log('error loading ad', error.message);
  };

  const openPlayStore = () => {
    Linking.openURL(
      'https://play.google.com/store/apps/details?id=com.backgammon_leaderboards&pcampaignid=web_share',
    ).catch(err => {
      console.error('Could not open the Play Store', err);
    });
  };

  return (
    <>
      <GAMBannerAd
        unitId={'ca-app-pub-7497957931538271/9931339721'}
        sizes={[BannerAdSize.ANCHORED_ADAPTIVE_BANNER]}
        onAdFailedToLoad={onAdFailedToLoad}
      />
      {!updateAvailable && (
        <View style={styles.updateContainer}>
          <Text>Update available for the app</Text>
          <Button
            title="Update Now"
            color={colors.accent}
            onPress={() => openPlayStore()}
          />
        </View>
      )}
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
