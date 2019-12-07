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

        // we didn't find winning or losing spot, so we attack
        const attackingSelectedMove = getAttackingMove();
        if( attackingSelectedMove ){
            return attackingSelectedMove;
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
            checkPossibleCriticalSpot(possibleRowSpot, defendingSpots, board.length - 2);
        }

        if( winningSpots.length === 0 ){
            // nothing yet... keep searching. Let's do columns
            for( let i = 0; i < board.length; i++ ){
                let possibleColSpot = processColumnWin(i);
                checkPossibleCriticalSpot(possibleColSpot, winningSpots, -1);
                checkPossibleCriticalSpot(possibleColSpot, defendingSpots, board.length - 2);
            }
        }

        if( winningSpots.length === 0 ){
            // nothing yet... keep searching. Let's do direct diagonal
            let possibleDDSpot = processDirectDiagonalWin();
            checkPossibleCriticalSpot(possibleDDSpot, winningSpots, -1);
            checkPossibleCriticalSpot(possibleDDSpot, defendingSpots, board.length - 2);
        }

        if( winningSpots.length === 0 ){
            // nothing yet... keep searching. Let's do inverted diagonal
            let possibleIDSpot = processInvertedDiagonalWin();
            checkPossibleCriticalSpot(possibleIDSpot, winningSpots, -1);
            checkPossibleCriticalSpot(possibleIDSpot, defendingSpots, board.length - 2);
        }
        // return all possible winning and defending spots
        return {
            winningSpots,
            defendingSpots
        }
    }

    // process one spot to see if it is viable as a winning or defending one
    function checkPossibleCriticalSpot(spot, criticalSpotsArray, targetValue){
        if( spot.sum === targetValue && spot.empties === 1 ){
            // this is one of the winning spots
            criticalSpotsArray.push({
                x: spot.row,
                y: spot.column
            });
        }
    }

    // process row for attack spots
    function checkPossibleAttackSpotsInRow(index, spotsArray){
        const order = board.length;
        let rowSpots = [];

        for(let i = 0; i < order; i++){
            // if one X is found, abort and clear possible spots. 
            // This row is already taken and useless
            if( board[index][i] === 1 ){ 
                rowSpots = [];
                break; 
            }
            // If -1 is found, save it. May be useful.
            if( board[index][i] === -1 ){ 
                rowSpots.push({
                    x: index,
                    y: i
                });
            }
        }

        // now we populate the global array. For every element, we pass the empties
        // of the set it belongs to, that is the temporal array’s length.
        if( rowSpots.length > 0 ){
            rowSpots.forEach(item => spotsArray.push({
                x: item.x,
                y: item.y,
                empties: rowSpots.length * -1,
                type: 'row'
            }));
        }
    }

    // process column for attack spots
    function checkPossibleAttackSpotsInColumn(index, spotsArray){
        const order = board.length;
        let colSpots = [];

        for(let i = 0; i < order; i++){
            // if one X is found, abort and clear possible spots. 
            // This column is already taken and useless
            if( board[i][index] === 1 ){ 
                colSpots = [];
                break; 
            }
            // If -1 is found, save it. May be useful.
            if( board[i][index] === -1 ){ 
                colSpots.push({
                    x: i,
                    y: index
                });
            }
        }

        // now we populate the global array. For every element, we pass the empties
        // of the set it belongs to, that is the temporal array’s length.
        if( colSpots.length > 0 ){
            colSpots.forEach(item => spotsArray.push({
                x: item.x,
                y: item.y,
                empties: colSpots.length * -1,
                type: 'column'
            }));
        }
    }

    // process direct diagonal for attack spots
    function checkPossibleAttackSpotsInDirectDiagonal(spotsArray){
        const order = board.length;
        let diagSpots = [];

        for(let i = 0; i < order; i++){
            // if one X is found, abort and clear possible spots. 
            // This column is already taken and useless
            if( board[i][i] === 1 ){ 
                diagSpots = [];
                break; 
            }
            // If -1 is found, save it. May be useful.
            if( board[i][i] === -1 ){ 
                diagSpots.push({
                    x: i,
                    y: i
                });
            }
        }

        // now we populate the global array. For every element, we pass the empties
        // of the set it belongs to, that is the temporal array’s length.
        if( diagSpots.length > 0 ){
            diagSpots.forEach(item => spotsArray.push({
                x: item.x,
                y: item.y,
                empties: diagSpots.length * -1,
                type: 'direct diagonal'
            }));
        }
    }

    // process inverted diagonal for attack spots
    function checkPossibleAttackSpotsInInvertedDiagonal(spotsArray){
        const order = board.length;
        let diagSpots = [];

        for(let i = 0, j = order - 1; i < order; i++, j--){
            // if one X is found, abort and clear possible spots. 
            // This column is already taken and useless
            if( board[i][j] === 1 ){ 
                diagSpots = [];
                break; 
            }
            // If -1 is found, save it. May be useful.
            if( board[i][j] === -1 ){ 
                diagSpots.push({
                    x: i,
                    y: j
                });
            }
        }

        // now we populate the global array. For every element, we pass the empties
        // of the set it belongs to, that is the temporal array’s length.
        if( diagSpots.length > 0 ){
            diagSpots.forEach(item => spotsArray.push({
                x: item.x,
                y: item.y,
                empties: diagSpots.length * -1,
                type: 'inverted diagonal'
            }));
        }
    }

    function getAttackingMove(){
        // this array will contain every possible move, even repeated ones
        let attackingArray = [];

        // find out what happens with rows and columns
        for(let i = 0; i < board.length; i++){
            checkPossibleAttackSpotsInRow(i, attackingArray);
            checkPossibleAttackSpotsInColumn(i, attackingArray);
        }

        // find out what happens with diagonals
        checkPossibleAttackSpotsInDirectDiagonal(attackingArray);
        checkPossibleAttackSpotsInInvertedDiagonal(attackingArray);

        // now we look for repeated moves, cause those are the best ones
        let duplicatedAttackingArray = [];
        splitDuplicatedSpotsFromAttackArray( attackingArray, duplicatedAttackingArray);

        // if we have duplicated spots, lets find one with more repetitions
        if( duplicatedAttackingArray.length > 0 ){
            let mostRepeatedSpot = duplicatedAttackingArray[0];
            for( let i = 1; i < duplicatedAttackingArray.length; i++ ){
                if( duplicatedAttackingArray[i].repetitions > mostRepeatedSpot.repetitions ){
                    mostRepeatedSpot = duplicatedAttackingArray[i];
                }
            }

            // and we have our guy. Return it! (be carefull to return only the spot
            // to have direct access to x and y in findPossibleMove)          
            return mostRepeatedSpot.spot;
        }

        // if we didn't find any duplicated, then we will need to get
        // the most aggressive moves. That is, find which spots have 
        // empties property with the smallest values. Unfortunately, 
        // we need to check the array twice:
        //  -Once for finding the smallest empties value
        //  -Once for getting the spots that have that value
        let smallestEmpties = attackingArray[0].empties;
        for( let i = 1; i < attackingArray.length; i++ ){
            if( attackingArray[i].empties < smallestEmpties ){
                smallestEmpties = attackingArray[i].empties;
            }
        }

        // now we filter the spots that have that smallestEmpties as value
        const mostAggressive = attackingArray.filter( spot => spot.empties === smallestEmpties );
        
        // now we get a random value from this array and play
        let randomPick = Math.floor( Math.random() * mostAggressive.length );
        return mostAggressive[randomPick];
    }

    function splitDuplicatedSpotsFromAttackArray(sourceArray, targetArray){
        // this function extracts and deletes every duplicated element
        // in sourceArray and passes it to targetArray alongside with
        // the amount of times it appears in sourceArray.
        
        // first detect and mark the duplicated
        sourceArray.forEach((item, index) => {
            // if we haven't found it yet, it does not have marked property associated
            if( !item.repeated ){
                let repetitions = 0;
                for( let i = 0; i < sourceArray.length; i++ ){
                    let current = sourceArray[i];
                    // check if the spot is again in the array
                    if( current.x === item.x && current.y === item.y && index !== i){
                        // we found a duplicated
                        repetitions++;
                        // and marking it to avoid detecting this spot again
                        current['repeated'] = 1;
                    }
                }
                // if, after looking for it, the element is a duplicated,
                // record it and the amount of times it repeated
                if( repetitions > 0 ){
                    item['repeated'] = 1;
                    targetArray.push({
                        spot: item,
                        repetitions
                    });
                }
            }
        });
    }
})();
