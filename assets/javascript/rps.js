
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
  var peopleConnected = 0;

  // Ref to where we will store connections
  var connectionsRef = database.ref("/connections");
  //Provided by Firebase
  var connectedRef = database.ref(".info/connected");
  // Start game
  initializeGame();

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
      if(peopleConnected < 2) {
        // Add user to the connections list.
        var con = connectionsRef.push(true);
        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();
      }
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

    // Hide name submission after both players pick their name
    if(snap.key === 'name') {
      $('#name-submit').hide();
    }
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


  // JQuery listeners
  $(document).on('click', '#add-user', function(e) {
    e.preventDefault();
    var name = $('#name-input').val().trim();
    var playerNumber = $('#add-user').attr('data-player');
    var playerRef = database.ref('players'); 
    var thisPlayer = playerRef.child(playerNumber);
    thisPlayer.update({ name });
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
  function initializeGame() {
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
      } 
    }

    fireBaseInit(gameData)
  }

  function fireBaseInit(data) {
    database.ref('/players/player1').set(data.player1);
    database.ref('/players/player2').set(data.player2);
    database.ref('/turn').set({ turn: data.turn });
    // database.ref('/messages').set({})
  }

})