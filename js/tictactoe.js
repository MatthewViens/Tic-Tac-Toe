(function(){
  // Global variables for UI components.
  const body = document.getElementsByTagName('body')[0],
        startScreen = document.getElementById('start'),
        boardScreen = document.getElementById('board'),
        endScreen = document.getElementById('finish');
        name1input = document.querySelectorAll('input[type="text"]')[0],
        name2input = document.querySelectorAll('input[type="text"]')[1],
        onePlayerRadio = document.querySelectorAll('input[type="radio"]')[0],
        twoPlayerRadio = document.querySelectorAll('input[type="radio"]')[1],
        player1icon = document.querySelector('li.player1'),
        player2icon = document.querySelector('li.player2'),
        player1stats = document.getElementById('player1stats'),
        player2stats = document.getElementById('player2stats');

  // Player objects.
  const player1 = {
    name: 'Player 1',
    score: 0,
    symbol: 'img/o.svg',
    markClass: 'box-filled-1',
    winScreen: 'screen-win-one'
  }

  const player2 = {
    name: 'Computer',
    score: 0,
    symbol: 'img/x.svg',
    markClass: 'box-filled-2',
    winScreen: 'screen-win-two'
  }

  // Other global variables.
  let tiles,
      currentPlayer,
      currentTurn,
      availableChoices,
      players = 1,
      winningArrays = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]];

  // Set up default view.
  startScreen.style.display = 'block';
  boardScreen.style.display = 'none';
  endScreen.style.display = 'none';
  name2input.style.display = 'none';
  onePlayerRadio.setAttribute('checked', 'checked');

  // Event listener on radio buttons to show/hide secondary name input and
  // change number of players.
  onePlayerRadio.addEventListener('change', () => {
    players = 1;
    name2input.style.display = 'none';
    name2input.value = '';
    player2.name = "Computer";
  });

  twoPlayerRadio.addEventListener('change', ()=> {
    players = 2;
    name2input.style.display = 'inline';
    player2.name = "Player 2";
  });

  // Add Event listener to both 'New Game' buttons to trigger startNewGame().
  document.querySelectorAll('.button')[0].addEventListener('click', startNewGame);
  document.querySelectorAll('.button')[1].addEventListener('click', startNewGame);

  function startNewGame(){
    // Reset game variables, player 1 goes first.
    currentTurn = 0;
    currentPlayer = player1;
    player1icon.classList.add('active');
    player2icon.classList.remove('active');
    player1.choices = [];
    player2.choices = [];
    availableChoices = [];
    // Reset End Screens.
    endScreen.classList.remove(player1.winScreen);
    endScreen.classList.remove(player2.winScreen);
    endScreen.classList.remove('screen-win-tie');
    // Show Board Screen.
    startScreen.style.display = 'none';
    boardScreen.style.display = 'block';
    endScreen.style.display = 'none';
    // Display player names on Board Screen if user input name.
    if (name1input.value.trim() !== ''){
      player1.name = name1input.value;
    }
    if (name2input.value.trim() !== ''){
      player2.name = name2input.value;
    }
    player1stats.textContent = `${player1.score} ${player1.name}`;
    player2stats.textContent = `${player2.score} ${player2.name}`;

    tiles = document.querySelectorAll('.box');
    for(let i = 0; i < tiles.length; i++){
      // Add data attribute to tiles 0-9.
      tiles[i].setAttribute('data-box', i);
      // Add values 0-9 to availableChoices for computer.
      availableChoices.push(i);
      // Remove any player marks/background images from previous games.
      tiles[i].classList.remove(player1.markClass);
      tiles[i].classList.remove(player2.markClass);
      tiles[i].style.backgroundImage = '';
      // Remove any leftover event listeners from previous games.
      tiles[i].removeEventListener('click', updateGame);
      // Add new event listeners to all tiles.
        // On mouseover show player mark.
        // On mouseleave remove player mark.
        // On click updateGame() - can only be triggered once.
      tiles[i].addEventListener('mouseover', addBackground);
      tiles[i].addEventListener('mouseout', removeBackground);
      tiles[i].addEventListener('click', updateGame, {once: true});
    }
  }

  // Function invoked when computer is taking a turn so that player cannot
  // click while turn is in progress.
  function preventClicks(e){
    e.stopPropagation();
    e.preventDefault();
  }

  // Helper function to change current player display.
  function changeCurrentPlayer(){
    player1icon.classList.toggle('active');
    player2icon.classList.toggle('active');
  }

  // Helper function to change background of tile to current player symbol.
  function addBackground(){
    // Always show player1 symbol if it's a single player game.
    if(players === 1){
      this.style.backgroundImage = `url(${player1.symbol})`;
    } else {
      this.style.backgroundImage = `url(${currentPlayer.symbol}`;
      }
  }

  // Helper function to remove background of tile.
  function removeBackground(){
    this.style.backgroundImage = '';
  }

  // updateGame() is triggered whenever a tile is clicked.
  function updateGame(){
    // Mark tile claimed by current player.
    this.style.backgroundImage = '';
    this.classList.add(currentPlayer.markClass);
    // Remove hover effect.
    this.removeEventListener('mouseover', addBackground);
    this.removeEventListener('mouseout', removeBackground);
    // Get the data attribute from tile and add to player choices array to
    // check for wins at end of turn.
    let choice = parseInt(this.getAttribute('data-box'));
    currentPlayer.choices.push(choice);
    // Remove selected tile from availableChoices so computer knows which
    // tiles it can choose from.
    availableChoices.splice(availableChoices.indexOf(choice), 1);
    // Cycle through each set of possible winning conditions
      // For each set, cycle through player choices array.
      // For each choice that matches an element in current winning conditions
        // set, increment hits variable by 1.
      // Three hits in any winning set means the game is won, invoke GameOver()
        // with currentPlayer as argument.
    for(let i = 0; i < winningArrays.length; i++){
      let hits = 0;
      for(let j = 0; j < currentPlayer.choices.length; j++){
        if(winningArrays[i].includes(currentPlayer.choices[j])){
          hits++;
        }
        if(hits >= 3){
          gameOver(currentPlayer);
          return;
        }
      }
    }
    // If there are no winners, instead check if currentTurn === 8, if so there
    // are no more available moves - invoke GameOver() with no arguments.
    if(currentTurn === 8){
      gameOver();
      return;
    }
    // Change current player, increment currentTurn, and invoke ComputerTurn()
    // if it's a single player game.
    currentPlayer === player1 ? currentPlayer = player2 : currentPlayer = player1;
    currentTurn++;
    changeCurrentPlayer();
    if(players === 1 && currentPlayer === player2){
      computerTurn();
    }
  }

  // Invoked after player takes a turn in a single player game.
  function computerTurn(){
    // Add event listener to body to invoke preventClicks.
    body.addEventListener('click', preventClicks, true);
    // Set timeout to simulate a person taking a turn so it's not instantaneous.
    setTimeout(function(){
      // Make a random decision based on available choices left and click that tile.
      randomDecision = availableChoices[Math.floor(Math.random() * availableChoices.length)];
      // Remove preventClicks
      body.removeEventListener('click', preventClicks, true);
      document.querySelector(`.box[data-box="${randomDecision}"]`).click();
    }, 1000);
  }

  // Invoked when turns is 8 or a player has 3 'hits' in a winning set.
  function gameOver(winner){
    // Show End Screen.
    startScreen.style.display = 'none';
    boardScreen.style.display = 'none';
    endScreen.style.display = 'block';
    let message = document.querySelector('.message');
    // If a winner argument is passed into gameOver():
      // Increment winner score.
      // Add winner class to End Screen.
      // change message to show winner name.
    if(winner){
      winner.score++;
      endScreen.classList.add(winner.winScreen);
      message.textContent = `${winner.name} Wins`;
    // If no winner argument is passed into gameOver() it means the game was a tie.
    } else {
      // Add tie class to End Screen and show tie message.
      endScreen.classList.add('screen-win-tie');
      message.textContent = 'It\'s a Tie!';
    }
  }
}());
