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
    // possible AI moves
    let possibleMoves = [];

    // forEach is necessary because every single square needs the event. When
    // the click in bound:
        // e.target points to the image inside the .square div (we click the image)
        // this points to the actual .square div.
    document.querySelectorAll('.board .square').forEach( item => {
        item.addEventListener('click', function(e){            
            if( canPlay ){
                let used = this.getAttribute('used'); 
                let row = this.getAttribute('x');
                let column = this.getAttribute('y');
                
                if( used === '0' ){
                    makeMove(row, column, this, e.target);

                    if( canPlay ){
                        const aiMove = findPossibleMove();
                        makeMove( aiMove.x, aiMove.y );
                    }
                }
            } 
        });
    });

    function makeMove(row, column, square, img){
        let squareTag, imgTag;
        
        // Get the square and the img related to it
        if( square && img ){
            // the player is moving. We are ready to go
            squareTag = square;
            imgTag = img;
        } else {
            // the computer is moving. We need to search the elements
            document.querySelectorAll('.board .square').forEach(item => {
                const x = parseInt(item.getAttribute('x'));
                const y = parseInt(item.getAttribute('y'));

                if( x === row && y === column ){
                    squareTag = item;
                    imgTag = squareTag.children[0];
                }
            });
        }

        // do the actual move
        imgTag.setAttribute('src', './images/' + turn + '.png');
        squareTag.setAttribute('used', '1');
        squareTag.setAttribute('value', values[turn]);
        board[row][column] = values[turn];
        completedPlays++;
        turn = turn === 'cross' ? 'circle' : 'cross';

        // REMOVE
        // console.log( board );
        // console.log( sumDirectDiagonalValue() );
        // console.log( sumInvertedDiagonalValue() );
        // console.log( '----------------------------' );
        // REMOVE

        // check if the game is over, with victory...
        if( gameHasBeenWon(row, column) ){
            document.getElementById('result__text').innerText = 'We have a winner!!!';
            canPlay = false;
        } else {
            // ...or with draw
            if( completedPlays === board.length ** 2 ){
                document.getElementById('result__text').innerText = 'Well, it\'s a Draw...';
                canPlay = false;
            }
        }
    }

    function isInDirectDiagonal(row, column){        
        return parseInt(row) === parseInt(column);
    }

    function isInInvertedDiagonal(row, column, order){
        return parseInt(row) + parseInt(column) === order - 1;
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

    function findPossibleMove(){
        // first the AI will try to win or defend
        const criticalSpots = findCriticalSpots();
        // get both arrays
        const winningSpots = criticalSpots.winningSpots;
        const defendingSpots = criticalSpots.defendingSpots;

        if( winningSpots.length > 0 ){
            // we have a winning move, USE it
            return winningSpots[0];
        }

        if( defendingSpots.length > 0 ){
            // we have a defending move, USE it
            return defendingSpots[0];
        }

        // random movement, default option
        // since AI plays every one turn, better to flush the possible moves
        // to take into consideration last player move
        possibleMoves = [];
        const order = board.length;

        for( let i = 0; i < order; i++ )
            for( let j = 0; j < order; j++ )
                if( board[i][j] === -1 )
                    possibleMoves.push({
                        x: i,
                        y: j
                    });
        
        // we have an array with all possible moves. Now we simply
        // peek one random
        const moveIndex = Math.floor( Math.random() * possibleMoves.length );
        return possibleMoves[ moveIndex ];
    }

    function processRowWin(index){
        let obj = { 
            sum: 0, 
            empties: 0,
            row: -1,
            column: -1
        };
        for( let i = 0; i < board.length; i++ ){
            obj.sum += board[index][i];
            if( board[index][i] === -1 ){
                obj.empties++;
                obj.row = index;
                obj.column = i;
            }
        }
        return obj;
    }

    function processColumnWin(index){
        let obj = { 
            sum: 0, 
            empties: 0,
            row: -1,
            column: -1
        };
        for( let i = 0; i < board.length; i++ ){
            obj.sum += board[i][index];
            if( board[i][index] === -1 ){
                obj.empties++;
                obj.row = i;
                obj.column = index;
            }
        }
        return obj;
    }

    function processDirectDiagonalWin(){
        let obj = { 
            sum: 0, 
            empties: 0,
            row: -1,
            column: -1
        };
        for( let i = 0; i < board.length; i++ ){
            obj.sum += board[i][i];
            if( board[i][i] === -1 ){
                obj.empties++;
                obj.row = i;
                obj.column = i;
            }
        }
        return obj;
    }

    function processInvertedDiagonalWin(){
        let obj = { 
            sum: 0, 
            empties: 0,
            row: -1,
            column: -1
        };
        for( let i = 0, j = board.length - 1; i < board.length; i++, j-- ){
            obj.sum += board[i][j];
            if( board[i][j] === -1 ){
                obj.empties++;
                obj.row = i;
                obj.column = j;
            }
        }
        return obj;
    }

    function findCriticalSpots(){
        let winningSpots = [];
        let defendingSpots = [];
        
        // first the rows
        for( let i = 0; i < board.length; i++ ){
            let possibleRowSpot = processRowWin(i);
            checkPossibleCriticalSpot(possibleRowSpot, winningSpots, -1);
            checkPossibleCriticalSpot(possibleRowSpot, defendingSpots, 1);
        }

        if( winningSpots.length === 0 ){
            // nothing yet... keep searching. Let's do columns
            for( let i = 0; i < board.length; i++ ){
                let possibleColSpot = processColumnWin(i);
                checkPossibleCriticalSpot(possibleColSpot, winningSpots, -1);
                checkPossibleCriticalSpot(possibleColSpot, defendingSpots, 1);
            }
        }

        if( winningSpots.length === 0 ){
            // nothing yet... keep searching. Let's do direct diagonal
            let possibleDDSpot = processDirectDiagonalWin();
            checkPossibleCriticalSpot(possibleDDSpot, winningSpots, -1);
            checkPossibleCriticalSpot(possibleDDSpot, defendingSpots, 1);
        }

        if( winningSpots.length === 0 ){
            // nothing yet... keep searching. Let's do inverted diagonal
            let possibleIDSpot = processInvertedDiagonalWin();
            checkPossibleCriticalSpot(possibleIDSpot, winningSpots, -1);
            checkPossibleCriticalSpot(possibleIDSpot, defendingSpots, 1);
        }
        // return all possible winning and defending spots
        return {
            winningSpots,
            defendingSpots
        }
    }

    // process one spot to see if it is viable as a winning one
    function checkPossibleCriticalSpot(spot, criticalSpotsArray, targetValue){
        if( spot.sum === targetValue && spot.empties === 1 ){
            // this is one of the winning spots
            criticalSpotsArray.push({
                x: spot.row,
                y: spot.column
            });
        }
    }
})();
