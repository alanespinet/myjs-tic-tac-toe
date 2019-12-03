(function( ){
    // using 'cross' and 'circle' as values, we can create then images names
    // by just saying: _ turn + '.png' _
    let turn = 'cross';
    let values = {
        circle: 0,
        cross: 1
    };
    // this is the board representation, a bi-dimensional array
    let board = [
        [-1, -1, -1],
        [-1, -1, -1],
        [-1, -1, -1]
    ];
    // the amount of plays done so far. When it gets 9 and we have no
    // winner, its a draw:
    let completedPlays = 0;
    // alloys the player to keep playing
    let canPlay = true;

    // forEach is necessary because every single square needs the event. When
    // the click in bound:
        // e.target points to the image inside the .square div (we click the image)
        // this points to the actual .square div.
    document.querySelectorAll('.board .square').forEach( item => {
        item.addEventListener('click', function(e){
            if( canPlay ){
                let used = this.getAttribute('used');          
                if( used === '0' ){
                    e.target.setAttribute('src', './images/' + turn + '.png');
                    this.setAttribute('used', '1');                
                    this.setAttribute('value', values[turn]);
                    let row = this.getAttribute('x');
                    let column = this.getAttribute('y');
                    board[row][column] = values[turn];
                    completedPlays++;

                    if( gameHasBeenWon(row, column) ){
                        document.getElementById('result__text').innerText = turn + ' Player Wins!!!';
                        canPlay = false;
                    } else {
                        if( completedPlays === board.length ** 2 ){
                            document.getElementById('result__text').innerText = 'Well, it\'s a Draw...';
                            canPlay = false;
                        }
                    }

                    turn = turn === 'cross' ? 'circle' : 'cross';
                }
            } 
        });
    });

    function isInDirectDiagonal(row, column){
        return row && parseInt(row) === parseInt(column);
    }

    function isInInvertedDiagonal(row, column, order){
        return row && column && parseInt(row) + parseInt(column) === order - 1;
    }

    function gameHasBeenWon(row, column){
        let won = false;
        const order = board.length;

        // check the row first
        const rowFirstValue = board[row][0];
        let rowWon = true;

        for( let i = 1; i < order; i++ ){
            if( board[row][i] !== rowFirstValue ){
                rowWon = false;
                break;
            }
        }
        won = rowWon;

        if( !won ){
            // check the column only if the row didn't win
            const columnFirstValue = board[0][column];
            let columnWon = true;

            for( let i = 1; i < order; i++ ){
                if( board[i][column] !== columnFirstValue ){
                    columnWon = false;
                    break;
                }
            }
            won = columnWon;
        }

        // Direct Diagonal
        if( isInDirectDiagonal(row, column) && !won ){
            // check diagonal only if the win hasn't been achieved
            const diagonalFirstValue = board[0][0];
            let directDiagonalWon = true;

            for( let i = 1; i < order; i++ ){
                if( board[i][i] !== diagonalFirstValue ){
                    directDiagonalWon = false;
                    break;
                }
            }
            won = directDiagonalWon;
        }

        // Inverted Diagonal
        if( isInInvertedDiagonal(row, column, order) && !won ){
            // check diagonal only if the win hasn't been achieved
            const iDiagonalFirstValue = board[0][order - 1];
            let invertedDiagonalWon = true;

            for( let i = 1, j = order - 2; i < order; i++, j-- ){
                if( board[i][j] !== iDiagonalFirstValue ){
                    invertedDiagonalWon = false;
                    break;
                }
            }
            won = invertedDiagonalWon;
        } 

        return won;
    }
})();
