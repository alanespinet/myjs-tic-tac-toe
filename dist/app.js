"use strict";

(function () {
  // using 'cross' and 'circle' as values, we can create then images names
  // by just saying: _ turn + '.png' _
  var turn = 'cross';
  var values = {
    circle: 0,
    cross: 1
  }; // this is the board representation, a bi-dimensional array

  var board = [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]]; // the amount of plays done so far. When it gets 9 and we have no
  // winner, its a draw:

  var completedPlays = 0; // alloys the player to keep playing

  var canPlay = true; // possible AI moves

  var possibleMoves = []; // forEach is necessary because every single square needs the event. When
  // the click in bound:
  // e.target points to the image inside the .square div (we click the image)
  // this points to the actual .square div.

  document.querySelectorAll('.board .square').forEach(function (item) {
    item.addEventListener('click', function (e) {
      if (canPlay) {
        var used = this.getAttribute('used');
        var row = this.getAttribute('x');
        var column = this.getAttribute('y');

        if (used === '0') {
          makeMove(row, column, this, e.target);

          if (canPlay) {
            var aiMove = findPossibleMove();
            makeMove(aiMove.x, aiMove.y);
          }
        }
      }
    });
  });

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
    turn = turn === 'cross' ? 'circle' : 'cross'; // REMOVE
    // console.log( board );
    // console.log( sumDirectDiagonalValue() );
    // console.log( sumInvertedDiagonalValue() );
    // console.log( '----------------------------' );
    // REMOVE
    // check if the game is over, with victory...

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
      checkPossibleCriticalSpot(possibleRowSpot, defendingSpots, 1);
    }

    if (winningSpots.length === 0) {
      // nothing yet... keep searching. Let's do columns
      for (var _i4 = 0; _i4 < board.length; _i4++) {
        var possibleColSpot = processColumnWin(_i4);
        checkPossibleCriticalSpot(possibleColSpot, winningSpots, -1);
        checkPossibleCriticalSpot(possibleColSpot, defendingSpots, 1);
      }
    }

    if (winningSpots.length === 0) {
      // nothing yet... keep searching. Let's do direct diagonal
      var possibleDDSpot = processDirectDiagonalWin();
      checkPossibleCriticalSpot(possibleDDSpot, winningSpots, -1);
      checkPossibleCriticalSpot(possibleDDSpot, defendingSpots, 1);
    }

    if (winningSpots.length === 0) {
      // nothing yet... keep searching. Let's do inverted diagonal
      var possibleIDSpot = processInvertedDiagonalWin();
      checkPossibleCriticalSpot(possibleIDSpot, winningSpots, -1);
      checkPossibleCriticalSpot(possibleIDSpot, defendingSpots, 1);
    } // return all possible winning and defending spots


    return {
      winningSpots: winningSpots,
      defendingSpots: defendingSpots
    };
  } // process one spot to see if it is viable as a winning one


  function checkPossibleCriticalSpot(spot, criticalSpotsArray, targetValue) {
    if (spot.sum === targetValue && spot.empties === 1) {
      // this is one of the winning spots
      criticalSpotsArray.push({
        x: spot.row,
        y: spot.column
      });
    }
  }
})();