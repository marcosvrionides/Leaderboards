const {onValueCreated} = require('firebase-functions/v2/database');
const {initializeApp} = require('firebase-admin/app');
const admin = require('firebase-admin');

initializeApp();

const database = admin.database();
const messaging = admin.messaging();

exports.onDataAdded = onValueCreated(
  {region: 'europe-west1', ref: '/{Leaderboard}/{gameID}/'},
  event => {
    const leaderboard = event.params.Leaderboard;
    const data = event.data.val();
    var ref = database.ref('/users');
    var uids = [];
    ref.once('value', snapshot => {
      snapshot.forEach(childSnapshot => {
        childSnapshot.forEach(grandchildSnapshot => {
          grandchildSnapshot.forEach(greatGrandchildSnapshot => {
            if (greatGrandchildSnapshot.key === leaderboard) {
              uids.push(childSnapshot.key);
            }
          });
        });
      });
    });

    const message = {
      data: {
        player_1: data.player_1_name,
        player_2: data.player_2_name,
        player_1_wins: data.player_1_games_won,
        player_2_wins: data.player_2_games_won,
        leaderboard: leaderboard,
      },
      topic: leaderboard,
    };

    // Send a message to devices subscribed to the provided topic.
    messaging
      .send(message)
      .then(response => {
        // Response is a message ID string.
        console.log(
          'Successfully sent message to topic "' + leaderboard + '"',
          response,
        );
      })
      .catch(error => {
        console.log(
          'Error sending message to topic "' + leaderboard + '"',
          error,
        );
      });

    return null;
  },
);
