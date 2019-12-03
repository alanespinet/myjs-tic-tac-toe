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

  var canPlay = true; // forEach is necessary because every single square needs the event. When
  // the click in bound:
  // e.target points to the image inside the .square div (we click the image)
  // this points to the actual .square div.

  document.querySelectorAll('.board .square').forEach(function (item) {
    item.addEventListener('click', function (e) {
      if (canPlay) {
        var used = this.getAttribute('used');

        if (used === '0') {
          e.target.setAttribute('src', './images/' + turn + '.png');
          this.setAttribute('used', '1');
          this.setAttribute('value', values[turn]);
          var row = this.getAttribute('x');
          var column = this.getAttribute('y');
          board[row][column] = values[turn];
          completedPlays++;

          if (gameHasBeenWon(row, column)) {
            document.getElementById('result__text').innerText = turn + ' Player Wins!!!';
            canPlay = false;
          } else {
            if (completedPlays === Math.pow(board.length, 2)) {
              document.getElementById('result__text').innerText = 'Well, it\'s a Draw...';
              canPlay = false;
            }
          }

          turn = turn === 'cross' ? 'circle' : 'cross';
        }
      }
    });
  });

  function isInDirectDiagonal(row, column) {
    return row && parseInt(row) === parseInt(column);
  }

  function isInInvertedDiagonal(row, column, order) {
    return row && column && parseInt(row) + parseInt(column) === order - 1;
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
})();