"use strict";

(function () {
  // using 'cross' and 'circle' as values, we can create then images names
  // by just saying: _ turn + '.png' _
  var turn = 'cross';
  var values = {
    circle: 0,
    cross: 1
  }; // this is the board representation, a bi-dimensional array

  var board = null; // the amount of plays done so far. When it gets 9 and we have no
  // winner, its a draw:

  var completedPlays = 0; // alloys the player to keep playing

  var canPlay = false; // possible AI moves

  var possibleMoves = []; // difficulty. Comes from UI

  var difficultyTarget = 100; // order of the game

  var order = 3; // matchMedia

  var mediaQ = window.matchMedia('(max-width: 767px)');
  document.querySelector('.board').addEventListener('click', function (e) {
    if (e.target && e.target.nodeName == 'IMG') {
      var img = e.target;
      var square = e.target.parentNode;

      if (canPlay) {
        var used = square.getAttribute('used');
        var row = square.getAttribute('x');
        var column = square.getAttribute('y');

        if (used === '0') {
          makeMove(row, column, square, img);

          if (canPlay) {
            var aiMove = findPossibleMove();
            makeMove(aiMove.x, aiMove.y);
          }
        }
      } else {
        alert('Please select Order and Difficulty in order to Play');
      }
    }
  });
  document.getElementById('btn-play').addEventListener('click', function () {
    var orderOptions = document.getElementById('game-order').options;
    var orderIndex = document.getElementById('game-order').selectedIndex;
    order = orderOptions[orderIndex].getAttribute('data-order');
    var difficultyOptions = document.getElementById('game-difficulty').options;
    var difficultyIndex = document.getElementById('game-difficulty').selectedIndex;
    difficultyTarget = difficultyOptions[difficultyIndex].getAttribute('data-difficulty');
    drawBoard();
    turn = 'cross';
    completedPlays = 0;
    possibleMoves = [];
    canPlay = true;
    document.querySelectorAll('div.square').forEach(function (item) {
      item.style.opacity = '1';
      disableUI();
    });
  });

  function disableUI() {
    document.getElementById('game-order').setAttribute('disabled', 'disabled');
    document.getElementById('game-difficulty').setAttribute('disabled', 'disabled');
    document.getElementById('btn-play').setAttribute('disabled', 'disabled');
    document.getElementById('result__text').innerHTML = '&nbsp;';
  }

  function makeMove(row, column, square, img) {
    var squareTag, imgTag; // Get the square and the img related to it

    if (square && img) {
      // the player is moving. We are ready to go
      squareTag = square;
      imgTag = img;
    } else {
      // the computer is moving. We need to search the elements
      document.querySelectorAll('.board .square').forEach(function (item) {
        var x = parseInt(item.getAttribute('x'));
        var y = parseInt(item.getAttribute('y'));

        if (x === row && y === column) {
          squareTag = item;
          imgTag = squareTag.children[0];
        }
      });
    } // do the actual move


    imgTag.setAttribute('src', './images/' + turn + '.png');
    squareTag.setAttribute('used', '1');
    squareTag.setAttribute('value', values[turn]);
    board[row][column] = values[turn];
    completedPlays++;
    turn = turn === 'cross' ? 'circle' : 'cross'; // check if the game is over, with victory...

    if (gameHasBeenWon(row, column)) {
      document.getElementById('result__text').innerText = 'We have a winner!!!';
      canPlay = false;
    } else {
      // ...or with draw
      if (completedPlays === Math.pow(board.length, 2)) {
        document.getElementById('result__text').innerText = 'Well, it\'s a Draw...';
        canPlay = false;
      }
    }

    if (!canPlay) {
      document.querySelectorAll('div.square').forEach(function (item) {
        item.style.opacity = '0.09';
        enableUI();
      });
    }
  }

  function enableUI() {
    document.getElementById('game-order').removeAttribute('disabled');
    document.getElementById('game-difficulty').removeAttribute('disabled');
    document.getElementById('btn-play').removeAttribute('disabled');
  }

  function isInDirectDiagonal(row, column) {
    return parseInt(row) === parseInt(column);
  }

  function isInInvertedDiagonal(row, column, order) {
    return parseInt(row) + parseInt(column) === order - 1;
  }

  function gameHasBeenWon(row, column) {
    var won = false;
    var order = board.length; // check the row first

    var rowFirstValue = board[row][0];
    var rowWon = true;

    for (var i = 1; i < order; i++) {
      if (board[row][i] !== rowFirstValue) {
        rowWon = false;
        break;
      }
    }

    won = rowWon;

    if (!won) {
      // check the column only if the row didn't win
      var columnFirstValue = board[0][column];
      var columnWon = true;

      for (var _i = 1; _i < order; _i++) {
        if (board[_i][column] !== columnFirstValue) {
          columnWon = false;
          break;
        }
      }

      won = columnWon;
    } // Direct Diagonal


    if (isInDirectDiagonal(row, column) && !won) {
      // check diagonal only if the win hasn't been achieved
      var diagonalFirstValue = board[0][0];
      var directDiagonalWon = true;

      for (var _i2 = 1; _i2 < order; _i2++) {
        if (board[_i2][_i2] !== diagonalFirstValue) {
          directDiagonalWon = false;
          break;
        }
      }

      won = directDiagonalWon;
    } // Inverted Diagonal


    if (isInInvertedDiagonal(row, column, order) && !won) {
      // check diagonal only if the win hasn't been achieved
      var iDiagonalFirstValue = board[0][order - 1];
      var invertedDiagonalWon = true;

      for (var _i3 = 1, j = order - 2; _i3 < order; _i3++, j--) {
        if (board[_i3][j] !== iDiagonalFirstValue) {
          invertedDiagonalWon = false;
          break;
        }
      }

      won = invertedDiagonalWon;
    }

    return won;
  }

  function findPossibleMove() {
    // play intelligently based on difficultyTarget
    var difficultyRnd = Math.floor(Math.random() * 100);
    var intelligentMove = makeIntelligentMove();

    if (difficultyRnd < difficultyTarget && intelligentMove) {
      return intelligentMove;
    } // random movement, default option
    // since AI plays every one turn, better to flush the possible moves
    // to take into consideration last player move


    possibleMoves = [];
    var order = board.length;

    for (var i = 0; i < order; i++) {
      for (var j = 0; j < order; j++) {
        if (board[i][j] === -1) possibleMoves.push({
          x: i,
          y: j
        });
      }
    } // we have an array with all possible moves. Now we simply
    // peek one random


    var moveIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[moveIndex];
  }

  function makeIntelligentMove() {
    // first the AI will try to win or defend
    var criticalSpots = findCriticalSpots(); // get both arrays

    var winningSpots = criticalSpots.winningSpots;
    var defendingSpots = criticalSpots.defendingSpots;

    if (winningSpots.length > 0) {
      // we have a winning move, USE it
      return winningSpots[0];
    }

    if (defendingSpots.length > 0) {
      // we have a defending move, USE it
      return defendingSpots[0];
    } // we didn't find winning or losing spot, so we attack


    var attackingSelectedMove = getAttackingMove();

    if (attackingSelectedMove) {
      return attackingSelectedMove;
    }
  }

  function processRowWin(index) {
    var obj = {
      sum: 0,
      empties: 0,
      row: -1,
      column: -1
    };

    for (var i = 0; i < board.length; i++) {
      obj.sum += board[index][i];

      if (board[index][i] === -1) {
        obj.empties++;
        obj.row = index;
        obj.column = i;
      }
    }

    return obj;
  }

  function processColumnWin(index) {
    var obj = {
      sum: 0,
      empties: 0,
      row: -1,
      column: -1
    };

    for (var i = 0; i < board.length; i++) {
      obj.sum += board[i][index];

      if (board[i][index] === -1) {
        obj.empties++;
        obj.row = i;
        obj.column = index;
      }
    }

    return obj;
  }

  function processDirectDiagonalWin() {
    var obj = {
      sum: 0,
      empties: 0,
      row: -1,
      column: -1
    };

    for (var i = 0; i < board.length; i++) {
      obj.sum += board[i][i];

      if (board[i][i] === -1) {
        obj.empties++;
        obj.row = i;
        obj.column = i;
      }
    }

    return obj;
  }

  function processInvertedDiagonalWin() {
    var obj = {
      sum: 0,
      empties: 0,
      row: -1,
      column: -1
    };

    for (var i = 0, j = board.length - 1; i < board.length; i++, j--) {
      obj.sum += board[i][j];

      if (board[i][j] === -1) {
        obj.empties++;
        obj.row = i;
        obj.column = j;
      }
    }

    return obj;
  }

  function findCriticalSpots() {
    var winningSpots = [];
    var defendingSpots = []; // first the rows

    for (var i = 0; i < board.length; i++) {
      var possibleRowSpot = processRowWin(i);
      checkPossibleCriticalSpot(possibleRowSpot, winningSpots, -1);
      checkPossibleCriticalSpot(possibleRowSpot, defendingSpots, board.length - 2);
    }

    if (winningSpots.length === 0) {
      // nothing yet... keep searching. Let's do columns
      for (var _i4 = 0; _i4 < board.length; _i4++) {
        var possibleColSpot = processColumnWin(_i4);
        checkPossibleCriticalSpot(possibleColSpot, winningSpots, -1);
        checkPossibleCriticalSpot(possibleColSpot, defendingSpots, board.length - 2);
      }
    }

    if (winningSpots.length === 0) {
      // nothing yet... keep searching. Let's do direct diagonal
      var possibleDDSpot = processDirectDiagonalWin();
      checkPossibleCriticalSpot(possibleDDSpot, winningSpots, -1);
      checkPossibleCriticalSpot(possibleDDSpot, defendingSpots, board.length - 2);
    }

    if (winningSpots.length === 0) {
      // nothing yet... keep searching. Let's do inverted diagonal
      var possibleIDSpot = processInvertedDiagonalWin();
      checkPossibleCriticalSpot(possibleIDSpot, winningSpots, -1);
      checkPossibleCriticalSpot(possibleIDSpot, defendingSpots, board.length - 2);
    } // return all possible winning and defending spots


    return {
      winningSpots: winningSpots,
      defendingSpots: defendingSpots
    };
  } // process one spot to see if it is viable as a winning or defending one


  function checkPossibleCriticalSpot(spot, criticalSpotsArray, targetValue) {
    if (spot.sum === targetValue && spot.empties === 1) {
      // this is one of the winning spots
      criticalSpotsArray.push({
        x: spot.row,
        y: spot.column
      });
    }
  }

  window.onload = function () {
    drawBoard();
  };

  function drawBoard() {
    var boardDiv = document.getElementsByClassName('board')[0];
    boardDiv.innerHTML = '';
    var cssPercent = parseInt(100 / order) - 1 + '%';

    for (var i = 0; i < order; i++) {
      for (var j = 0; j < order; j++) {
        var div = document.createElement('div');
        div.setAttribute('class', 'square');
        div.setAttribute('x', i);
        div.setAttribute('y', j);
        div.setAttribute('used', '0');
        div.setAttribute('value', '-1');
        var img = document.createElement('img');
        img.setAttribute('src', './images/blank.png');
        img.setAttribute('alt', '');
        div.appendChild(img);
        boardDiv.appendChild(div);
        div.setAttribute('style', 'flex-basis: ' + cssPercent + ';');
      }
    }

    adjustSquareHeights();
    createBoard();
  }

  function adjustSquareHeights() {
    document.querySelectorAll('div.square').forEach(function (item) {
      var w = window.getComputedStyle(item).width;
      var style = item.getAttribute('style');
      style += ' height: ' + w + ';';
      item.setAttribute('style', style);
    });
  }

  mediaQ.addListener(adjustSquareHeights);

  function createBoard() {
    board = [];

    for (var i = 0; i < order; i++) {
      var innerArr = [];

      for (var j = 0; j < order; j++) {
        innerArr.push(-1);
      }

      board.push(innerArr);
    }
  } // process row for attack spots


  function checkPossibleAttackSpotsInRow(index, spotsArray) {
    var order = board.length;
    var rowSpots = [];

    for (var i = 0; i < order; i++) {
      // if one X is found, abort and clear possible spots. 
      // This row is already taken and useless
      if (board[index][i] === 1) {
        rowSpots = [];
        break;
      } // If -1 is found, save it. May be useful.


      if (board[index][i] === -1) {
        rowSpots.push({
          x: index,
          y: i
        });
      }
    } // now we populate the global array. For every element, we pass the empties
    // of the set it belongs to, that is the temporal array’s length.


    if (rowSpots.length > 0) {
      rowSpots.forEach(function (item) {
        return spotsArray.push({
          x: item.x,
          y: item.y,
          empties: rowSpots.length,
          type: 'row'
        });
      });
    }
  } // process column for attack spots


  function checkPossibleAttackSpotsInColumn(index, spotsArray) {
    var order = board.length;
    var colSpots = [];

    for (var i = 0; i < order; i++) {
      // if one X is found, abort and clear possible spots. 
      // This column is already taken and useless
      if (board[i][index] === 1) {
        colSpots = [];
        break;
      } // If -1 is found, save it. May be useful.


      if (board[i][index] === -1) {
        colSpots.push({
          x: i,
          y: index
        });
      }
    } // now we populate the global array. For every element, we pass the empties
    // of the set it belongs to, that is the temporal array’s length.


    if (colSpots.length > 0) {
      colSpots.forEach(function (item) {
        return spotsArray.push({
          x: item.x,
          y: item.y,
          empties: colSpots.length,
          type: 'column'
        });
      });
    }
  } // process direct diagonal for attack spots


  function checkPossibleAttackSpotsInDirectDiagonal(spotsArray) {
    var order = board.length;
    var diagSpots = [];

    for (var i = 0; i < order; i++) {
      // if one X is found, abort and clear possible spots. 
      // This column is already taken and useless
      if (board[i][i] === 1) {
        diagSpots = [];
        break;
      } // If -1 is found, save it. May be useful.


      if (board[i][i] === -1) {
        diagSpots.push({
          x: i,
          y: i
        });
      }
    } // now we populate the global array. For every element, we pass the empties
    // of the set it belongs to, that is the temporal array’s length.


    if (diagSpots.length > 0) {
      diagSpots.forEach(function (item) {
        return spotsArray.push({
          x: item.x,
          y: item.y,
          empties: diagSpots.length,
          type: 'direct diagonal'
        });
      });
    }
  } // process inverted diagonal for attack spots


  function checkPossibleAttackSpotsInInvertedDiagonal(spotsArray) {
    var order = board.length;
    var diagSpots = [];

    for (var i = 0, j = order - 1; i < order; i++, j--) {
      // if one X is found, abort and clear possible spots. 
      // This column is already taken and useless
      if (board[i][j] === 1) {
        diagSpots = [];
        break;
      } // If -1 is found, save it. May be useful.


      if (board[i][j] === -1) {
        diagSpots.push({
          x: i,
          y: j
        });
      }
    } // now we populate the global array. For every element, we pass the empties
    // of the set it belongs to, that is the temporal array’s length.


    if (diagSpots.length > 0) {
      diagSpots.forEach(function (item) {
        return spotsArray.push({
          x: item.x,
          y: item.y,
          empties: diagSpots.length,
          type: 'inverted diagonal'
        });
      });
    }
  }

  function getAttackingMove() {
    // this array will contain every possible move, even repeated ones
    var attackingArray = []; // find out what happens with rows and columns

    for (var i = 0; i < board.length; i++) {
      checkPossibleAttackSpotsInRow(i, attackingArray);
      checkPossibleAttackSpotsInColumn(i, attackingArray);
    } // find out what happens with diagonals


    checkPossibleAttackSpotsInDirectDiagonal(attackingArray);
    checkPossibleAttackSpotsInInvertedDiagonal(attackingArray);

    if (attackingArray.length > 0) {
      // now we look for repeated moves, cause those are the best ones
      var duplicatedAttackingArray = [];
      splitDuplicatedSpotsFromAttackArray(attackingArray, duplicatedAttackingArray); // if we have duplicated spots, lets find one with more repetitions

      if (duplicatedAttackingArray.length > 0) {
        var mostRepeatedSpot = duplicatedAttackingArray[0];

        for (var _i5 = 1; _i5 < duplicatedAttackingArray.length; _i5++) {
          if (duplicatedAttackingArray[_i5].repetitions > mostRepeatedSpot.repetitions) {
            mostRepeatedSpot = duplicatedAttackingArray[_i5];
          }
        } // and we have our guy. Return it! (be carefull to return only the spot
        // to have direct access to x and y in findPossibleMove)          


        return mostRepeatedSpot.spot;
      } // if we didn't find any duplicated, then we will need to get
      // the most aggressive moves. That is, find which spots have 
      // empties property with the smallest values. Unfortunately, 
      // we need to check the array twice:
      //  -Once for finding the smallest empties value
      //  -Once for getting the spots that have that value


      var smallestEmpties = attackingArray[0].empties;

      for (var _i6 = 1; _i6 < attackingArray.length; _i6++) {
        if (attackingArray[_i6].empties < smallestEmpties) {
          smallestEmpties = attackingArray[_i6].empties;
        }
      } // now we filter the spots that have that smallestEmpties as value


      var mostAggressive = attackingArray.filter(function (spot) {
        return spot.empties === smallestEmpties;
      }); // now we get a random value from this array and play

      var randomPick = Math.floor(Math.random() * mostAggressive.length);
      return mostAggressive[randomPick];
    }
  }

  function splitDuplicatedSpotsFromAttackArray(sourceArray, targetArray) {
    // this function finds every duplicated element
    // in sourceArray and passes it to targetArray alongside with
    // the amount of times it appears in sourceArray.
    // first detect and mark the duplicated
    sourceArray.forEach(function (item, index) {
      // if we haven't found it yet, it does not have marked property associated
      if (!item.repeated) {
        var repetitions = 0;

        for (var i = 0; i < sourceArray.length; i++) {
          var current = sourceArray[i]; // check if the spot is again in the array

          if (current.x === item.x && current.y === item.y && index !== i) {
            // we found a duplicated
            repetitions++; // and marking it to avoid detecting this spot again

            current['repeated'] = 1;
          }
        } // if, after looking for it, the element is a duplicated,
        // record it and the amount of times it repeated


        if (repetitions > 0) {
          item['repeated'] = 1;
          targetArray.push({
            spot: item,
            repetitions: repetitions
          });
        }
      }
    });
  }
})();