
$(document).ready(function() {
  // Define Firebase
  const config = {
    apiKey: "AIzaSyDeMXQCMoGam_N4-TjyuwTykp4oHJLP4F0",
    authDomain: "to-do-list-802bc.firebaseapp.com",
    databaseURL: "https://to-do-list-802bc.firebaseio.com",
    projectId: "to-do-list-802bc",
    storageBucket: "to-do-list-802bc.appspot.com",
    messagingSenderId: "1096472633358"
  };
  firebase.initializeApp(config);

  // Assign the reference to the database to a variable named 'database'
  const database = firebase.database();
  
  
  const usernameInput = $('#username');
  const textInput = $('#text');
  const postButton = $('#post');
  let currentPlayer;
  let peopleConnected;

  // Ref to where we will store connections
  const connectionsRef = database.ref("/connections");
  //Provided by Firebase
  const connectedRef = database.ref(".info/connected");


  // Save useful references for using throughout the app
  const playerRef = database.ref('players');
  const playerOneRef = playerRef.child('player1');
  const playerTwoRef = playerRef.child('player2');
  const msgRef = database.ref('/messages');


  // Firebase data listeners
  
  connectedRef.on('value', function(snap) {
    
    // If they are connected..
    if (snap.val()) {
      // If the game isn't already full
      // if(peopleConnected < 2) {
        // Add user to the connections list.
        let con = connectionsRef.push(true);
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

    // If a name is being submitted, change the button data-attr, so
    // that the second person who picks their name second is writing their
    // name to the player two area of firebase
    if(snap.key === 'name') {
      // Change button data attributes
      $('#add-user').attr('data-player','player2');
    }

    // We put compare choices here, because we take the result and show it to both players
    // Any data to be shared and rendered between tab instances needs to 
    // go inside Firebase data listeners. Any non-shared data is placed inside JQuery
    // listeners. 
    compareChoices();
    // wins
    // losses
    // ties
  })

  playerTwoRef.on('child_changed', function(snap) {
    compareChoices();
  })

  msgRef.on('child_added',function(snap) {
    var msgObj = snap.val();
    // console.log(msgObj);
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
      // console.log(`A connection exists! There are ${connectionNum} connections`);
      peopleConnected = connectionNum;
      // console.log(`Local peopleConnected: ${peopleConnected}`);
    } else {
      // console.log('No connections exist');
    }

    // Player names
    grabValFromFirebase('/players/player1','name')
      .then(function(data) {
        $('#player1').text(data);
      })

    grabValFromFirebase('/players/player2','name')
      .then(function(data) {
        $('#player2').text(data);
      })
    
    // Player Scores

    // Player 1
    grabValFromFirebase('players/player1','wins')
      .then((data) => {
        $('#player-1-wins').text(data);
      })
    grabValFromFirebase('players/player1','losses')
      .then((data) => {
        $('#player-1-losses').text(data);
      })
    grabValFromFirebase('players/player1','ties')
      .then((data) => {
        $('#player-1-ties').text(data);
      })

    // Player 2
    grabValFromFirebase('players/player2','wins')
      .then((data) => {
        $('#player-2-wins').text(data);
      })
    grabValFromFirebase('players/player2','losses')
      .then((data) => {
        $('#player-2-losses').text(data);
      })
    grabValFromFirebase('players/player2','ties')
      .then((data) => {
        $('#player-2-ties').text(data);
      })

  })


  // JQuery listeners
  $(document).on('click', '#add-user', function(e) {
    e.preventDefault();
    // Grab the value from the input form
    var name = $('#name-input').val().trim();
    // Grab the data attribute with player-1 data attribute
    var playerNumber = $('#add-user').attr('data-player');
    // Create a ref to the players in Firebase
    var playerRef = database.ref('players'); 
    // Create a ref to the specific player 
    var thisPlayer = playerRef.child(playerNumber);
    // Update the specific players name key with the value taken from the name input
    thisPlayer.update({ name });
    // Hide the form for submitting username
    $('#name-submit').hide();
    // Show buttons
    $(`#${playerNumber}-buttons`).show();

    // Displays the chosen username to the DOM. note: it will also display to the opponent
    // because the .update() triggers a change in Firebase, which triggers a change on the DOM
    $(`#${playerNumber}`).text(name);
  })

  // This controls writing to the messages data ref on Fire Base
  postButton.on('click',function() {
    var user = usernameInput.val();
    var msg = textInput.val();
    database.ref('/messages').push({user, msg});
    textInput.val('');
  })


  $('.player1-choice').on("click", function(e) {
    var userChoice = $(this).attr('data-choice');
    // Target the id of add-user
    $(`#player1-choice`).text(userChoice);
    $('#player1-buttons').hide();
    playerOneRef.update({choice: userChoice});
  })

  $('.player2-choice').on("click", function(e) {
    var userChoice = $(this).attr('data-choice');
    // Target the id of add-user
    $(`#player2-choice`).text(userChoice);
    $('#player2-buttons').hide();
    playerTwoRef.update({choice: userChoice});
  })

  $('#delete-db').on('click',function(e){
    database.ref().set(null);
  })

  // Functions

  /**
   * Grabs the player choices from firebase and checks to see if both players have picked a choice.
   * If both players have picked a choice, run RPS logic on their choices to determine the winner and increment
   * their scores
   * Wrap the call to RPS logic in a JQuery .text() or .append() to show the result 
   */
  function compareChoices() {
   const playerOneChoice = grabValFromFirebase('players/player1','choice');
   const playerTwoChoice = grabValFromFirebase('players/player2','choice');
   const promiseArray = [playerOneChoice,playerTwoChoice];
   Promise.all(promiseArray)
    .then((choices) => {
      if(choices[0].length > 0 && choices[1].length > 0) {
        rpsLogic(choices[0],choices[1]);
        // Render Outcome to both players
        // Player 1 choice
        // Player 2 choice
        // Change The Winner is to winner
      }
    })
  }

  function rpsLogic(player1,player2) {
    // 2 > 1 > 0
    // p > r > s
    // s > p > r
    // r > s > p
    let r,p,s;

    // Player one choice changes the state of rps
    if(player1 === 'rock') {
      r = 1;
      p = 2;
      s = 0;
      player1 = r;
    }
    if(player1 === 'paper') {
      r = 0;
      p = 1;
      s = 2;
      player1 = p;
    }
    if(player1 === 'scissors') {
      r = 2;
      p = 0;
      s = 1;
      player1 = s;
    }

    // Player 2's choice's value is determined by the state of r,p,s set by player1
    if(player2 === 'rock') {
      player2 = r;
    }
    if(player2 === 'paper') {
      player2 = p;
    }
    if(player2 === 'scissors') {
      player2 = s;
    }  

    // CAREFUL!!! Need to remove the player choice values before updating scores in Firebase, otherwise..
    // 1) A data change (incrementing scores in Firebase) triggers a call to compareChoices,
    // which doesn't stop at the check for there being existing choices (were never removed).
    // 2) compareChoices calls rpsLogic, which does another game outcome check + score increment to Firebase
    // 3) Which brings us back to step 1
    
    // SOLUTION
    // We use clearing of choices in these blocks to act as control flow for
    // the 'if' block in compareChoices, which is meant to act as a base case
    if(player1 === player2) {
      // Empty player choices from Firebase to prevent infinite recursion
      playerOneRef.update({choice: ''});
      playerTwoRef.update({choice: ''});
      tie();
    }

    if(player1 > player2) {
      // Empty player choices from Firebase to prevent infinite recurison
      playerOneRef.update({choice: ''});
      playerTwoRef.update({choice: ''});
      winner('player1');
    }

    if(player1 < player2) {
      // Empty Player choices from Firebase to prevent infinite recursion
      playerOneRef.update({choice: ''});
      playerTwoRef.update({choice: ''});
      winner('player2');
    }
 
  }


  // Game logic functions
  
  /**
   * Increments the players ties
   */
  function tie() {
    const playerOneTies = grabValFromFirebase('players/player1','ties');
    const playerTwoTies = grabValFromFirebase('players/player2','ties');
    const promiseArray = [playerOneTies,playerTwoTies];
    Promise.all(promiseArray)
      .then((ties) => {
        let p1Ties = parseInt(ties[0]);
        let p2Ties = parseInt(ties[1]);
        playerOneRef.update({ties: p1Ties + 1});
        playerTwoRef.update({ties: p2Ties + 1});
      })
  }
  /**
   * Increments the players wins/losses depending on outcome
   * 
   * @param  {string} winner: is the winner of rock paper scissors represented as 'player1'/'player2'
   */
  function winner(champ) {
    let winPath, losePath;

    if(champ === 'player1') {
      winPath = champ;
      losePath = 'player2';
    }
    if(champ === 'player2') {
      winPath = champ;
      losePath = 'player1';
    }

    const winner = grabValFromFirebase(`players/${winPath}/`,'wins');
    const loser = grabValFromFirebase(`players/${losePath}/`,'losses');
    const promiseArray = [winner,loser];
    Promise.all(promiseArray)
      .then((scores) => {
        let winner = scores[0];
        let loser = scores[1];
        database.ref(`players/${winPath}`).update({wins: winner + 1});
        database.ref(`players/${losePath}`).update({losses: loser + 1});
      })
  }


  // Firebase Functions

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

  /**
   * Takes a path and child target, and return the value assoicated with that child target/key
   * @param  {string} path: is a path to where a child of interest exists
   * @param  {string} pathChild is the child key of interest to pull the value off of
   */
  function grabValFromFirebase(path,pathChild) {
    return database.ref(path).child(pathChild)
      .once('value')
      .then(function(snapshot) {
        var value = snapshot.val();
        // console.log(value);
        // return new Promise(function(resolve,reject) {
          // resolve(value);
        // })
        return value;
      })
  }

})