
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
  
  // Initialize firebase app with configuration
  firebase.initializeApp(config);

  // Short hands
  var database = firebase.database();
  var usernameInput = $('#username');
  var textInput = $('#text');
  var postButton = $('#post');

  // Start Game
  initializeGame();

  // Save useful references for using throughout the app
  var playerRef = database.ref('players');
  var playerOneRef = playerRef.child('player1');
  var playerTwoRef = playerRef.child('player2');


  // console.log(`Player Ref: ${playerRef}`);
  // console.log(`Player One Ref: ${playerOneRef}`);
  // console.log(`Player Two Ref: ${playerTwoRef}`);


  // Firebase listeners

  playerOneRef.on('child_changed', function(data) {
    // Log Player 1 changes as they occur
    console.log(`Val:${data.val()} Key: ${data.key}`);

    // If a name is being submitted, change the button data-attr, so
    // that the second person who picks their name second is writing their
    // name to the player two area of firebase
    if(data.key === 'name') {
      // Change button data attributes
      $('#add-user').attr('data-player','player2');
    }

  })


  playerTwoRef.on('child_changed', function(data) {
    // Log Player 2 changes as they occur
    console.log(`Val:${data.val()} Key: ${data.key}`);

    // Hide name submission after both players pick their name
    if(data.key === 'name') {
      $('#name-submit').hide();
    }
  })


  // JQuery listeners
  $(document).on('click', '#add-user', function(e) {
    e.preventDefault();
    var name = $('#name-input').val().trim();
    var playerNumber = $('#add-user').attr('data-player');
    var thisPlayer = playerRef.child(playerNumber);
    thisPlayer.update({ name });
  })

  postButton.on('click',function() {
    var msgUser = usernameInput.val();
    var msgText = textInput.val();
    database.ref('/messages').set(msgUser + " says: " + msgText);
    textInput.val('');
  })

  $('.choices').on("click", function(e) {
    var userChoice = $(this).attr('data-choice');
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

  // $.ajax({
  //   url: playerRef,
  //   method: 'GET'
  // }).then(function(response) {
  //   // console.log(response);
  // })

  // FIREBASE STUFF THAT MIGHT BE USEFUL
  // The key of any non-root reference is the last token in the path
  // var adaRef = firebase.database().ref("users/ada");
  // var key = adaRef.key;  // key === "ada"
  // key = adaRef.child("name/last").key;  // key === "last"


  // Firebase watcher + initial loader HINT: .on("value")
  // database.ref().on("value", function(snapshot) {
  //   console.log(snapshot.val());

  //   var formObj = snapshot.val();

  //   $('#name-display').text(formObj.name);
  //   $('#email-display').text(formObj.email);
  //   $('#age-display').text(formObj.age);
  //   $('#comment-display').text(formObj.comment);

  // }, function(errorObject) {
  //  console.log("The read failed: " + errorObject.code);
  // });

  // Create Error Handling
})