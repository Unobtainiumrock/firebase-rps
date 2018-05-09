
$(document).ready(function() {
  // Define Firebase
  var config = {
    apiKey: "AIzaSyDeMXQCMoGam_N4-TjyuwTykp4oHJLP4F0",
    authDomain: "to-do-list-802bc.firebaseapp.com",
    databaseURL: "https://to-do-list-802bc.firebaseio.com",
    projectId: "to-do-list-802bc",
    storageBucket: "to-do-list-802bc.appspot.com",
    messagingSenderId: "1096472633358"
  };
  firebase.initializeApp(config);

  // Assign the reference to the database to a variable named 'database'
  var database = firebase.database();
  
  
  var usernameInput = $('#username');
  var textInput = $('#text');
  var postButton = $('#post');
  var peopleConnected;

  // Ref to where we will store connections
  var connectionsRef = database.ref("/connections");
  //Provided by Firebase
  var connectedRef = database.ref(".info/connected");


  // Save useful references for using throughout the app
  var playerRef = database.ref('players');
  var playerOneRef = playerRef.child('player1');
  var playerTwoRef = playerRef.child('player2');
  var msgRef = database.ref('/messages');


  // Firebase data listeners
  
  connectedRef.on('value', function(snap) {
    
    // If they are connected..
    if (snap.val()) {
      // If the game isn't already full
      // if(peopleConnected < 2) {
        // Add user to the connections list.
        var con = connectionsRef.push(true);
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
      // }
    }
  });
  
  connectionsRef.on('value',function(snap) {
    peopleConnected = snap.numChildren();

    $('#people-connected').text(peopleConnected);
  })

  playerOneRef.on('child_changed', function(snap) {
    // Log Player 1 changes as they occur
    console.log(`Val:${snap.val()} Key: ${snap.key}`);

    // If a name is being submitted, change the button data-attr, so
    // that the second person who picks their name second is writing their
    // name to the player two area of firebase
    if(snap.key === 'name') {
      // Change button data attributes
      $('#add-user').attr('data-player','player2');
    }

  })

  playerTwoRef.on('child_changed', function(snap) {
    // Log Player 2 changes as they occur
    console.log(`Val:${snap.val()} Key: ${snap.key}`);

  })

  msgRef.on('child_added',function(snap) {
    var msgObj = snap.val();
    console.log(msgObj);
    // msg user

    var msgDiv = $('<div>');
    var user = $('<b>');
    var message = $('<p>');
    user.text(msgObj.user);
    message.text(msgObj.msg);
    msgDiv.append(user);
    msgDiv.append(message);

    $('#results').append(msgDiv);
  })

  database.ref().on('value',function(snap) {
    // If Firebase doesn't have the game data yet, set it up
    if(snap.child('/').numChildren() === 1) {

      var gameData = {
        turn: 1,
        player1: {
          name: '',
          wins: 0,
          losses: 0,
          ties: 0,
          choice: ''
        },
        player2: {
          name: '',
          wins: 0,
          losses: 0,
          ties: 0,
          choice: ''
        },
        dataAttr: {
          first: ''
        }
      }
      
      // Passes the game data object into fireBaseInit
      fireBaseInit(gameData)

    }

    if(snap.child('connections').exists()) {
      var connectionNum = snap.child('connections').numChildren();
      console.log(`A connection exists! There are ${connectionNum} connections`);
      peopleConnected = connectionNum;
      console.log(`Local peopleConnected: ${peopleConnected}`);
    } else {
      console.log('No connections exist');
    }
  })


  // JQuery listeners
  $(document).on('click', '#add-user', function(e) {
    e.preventDefault();
    var name = $('#name-input').val().trim();
    var playerNumber = $('#add-user').attr('data-player');
    var playerRef = database.ref('players'); 
    var thisPlayer = playerRef.child(playerNumber);
    thisPlayer.update({ name });
    $('#name-submit').hide();
  })

  postButton.on('click',function() {
    var user = usernameInput.val();
    var msg = textInput.val();
    database.ref('/messages').push({user, msg});
    textInput.val('');
  })

  $('.choices').on("click", function(e) {
    var userChoice = $(this).attr('data-choice');
  })


  $('#delete-db').on('click',function(e){
    database.ref().set(null);
  })

  // Functions

  /**
   * Sets of the initial keys for game data on Firebase 
   * @param  {Object} data: is an object containing game data
   */
  function fireBaseInit(data) {
    database.ref('/players/player1').set(data.player1);
    database.ref('/players/player2').set(data.player2);
    database.ref('/turn').set({ turn: data.turn });
    database.ref('/data-attributes').set(data.dataAttr);
  }

  /**
   * @param  {string} key: is the key we want to add to Firebase's /data-attributes path
   * @param  {string} val: is the value associated with the key added to Firebase. A string is used
   *                       for numbers as well, since we can just parseInt() form string to integer
   */
  function firebaseDataAttr(key,val) {
    var updaterObj = {};
    updaterObj[key] = val;

    database.ref('/data-attributes').update(updaterObj);
  }

})