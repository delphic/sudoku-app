/* This class generates a completed Sudoku Board
 * it does with permutations of a seed region
 * followed by a number of transforms to break
 * the symmetries resulting from this method.
 */
var FullBoardGenerator = function() {
    var sudokuBoard;

    function generateBoard() {
        sudokuBoard = new SudokuBoard();
        var seed = _generateSeedRegion();
        _generateBoardFromSeed(seed);
        _swapRowsAndColumnsWithinRegions();
        _breakSymmetry();

        return sudokuBoard;
    }

    function _breakSymmetry(){
        // This can only be performed due to the manner in which we are generating the board

        // Method:
        // Choose a pair of columns or rows
        // Choose a cell
        // Look at the number in the other column at that index
        // Find that number in the original column
        // Look at the number in the other column at this new index
        // Find that number in the original column
        // The number in this third index should match the original number
        // If not, previous transform has broken it abort!
        // If so, switch all the pairs
        // Add swapped indices to cache
        // Repeat once for each region column and region row

        // TODO: Logic between rows and columns can be refactored to increase DRYNESS

        // Rows
        for(var regionRow = 0; regionRow < 3; regionRow++) {
            var row1 = Math.floor(Math.random()*3);
            var row2 = (row1+1)%3;

            var indices = [];
            var pairs = [];

            for(var k=0; k < 3; k++) {
                indices.push( (k === 0) ? Math.floor(Math.random()*3) : Utilities.getXIndexForValueInRow(sudokuBoard, regionRow*3 + row1, pairs[k-1][1]) );
                pairs.push([ sudokuBoard.getValue(indices[k], regionRow*3 + row1), sudokuBoard.getValue(indices[k], regionRow*3 + row2) ]);
            }

            if(pairs[0][0] !== pairs[2][1]) {
                // This shouldn't ever happen
                console.log("Warning! Attempt to symmetry break row failed. This should never happen!");
                continue;
            }

            for(var n=0; n < 3; n++) {
                sudokuBoard.setValue(indices[n], regionRow*3 + row2, pairs[n][0]);
                sudokuBoard.setValue(indices[n], regionRow*3 + row1, pairs[n][1]);
                //console.log("Swapping numbers [" + pairs[n][0] + "," + pairs[n][1] + "] in column " + indices[n]);
            }
        }

        // Columns
        for(var regionColumn = 0; regionColumn < 3; regionColumn++) {
            var column1 = Math.floor(Math.random()*3);
            var column2 = (column1+1)%3;

            indices = [];
            pairs = [];
            for(k=0; k < 3; k++) {
                indices.push( (k === 0) ? Math.floor(Math.random()*3) : Utilities.getYIndexForValueInColumn(sudokuBoard, regionColumn*3 + column1, pairs[k-1][1]) );
                pairs.push([ sudokuBoard.getValue(regionColumn*3 + column1, indices[k]), sudokuBoard.getValue(regionColumn*3 + column2, indices[k]) ]);
            }

            if(pairs[0][0] !== pairs[2][1]) {
                // This can happen because transforms can have already broken the symmetry
                // technically there is always triple of pairs in each region even after
                // transforms, but I can't be bothered to write the logic to start this loop again
                // with initial index (+=1)%3 just now.

                //console.log("Warning! Attempt to symmetry break column failed.");
                continue;
            }

            for(n=0; n < 3; n++) {
                sudokuBoard.setValue(regionColumn*3 + column2, indices[n], pairs[n][0]);
                sudokuBoard.setValue(regionColumn*3 + column1, indices[n], pairs[n][1]);
                //console.log("Swapping numbers [" + pairs[n][0] + "," + pairs[n][1] + "] in row " + indices[n]);
            }

        }
    }

    function _swapRowsAndColumnsWithinRegions() {
        for(var swap = 0; swap < 10; swap++) {
            var regionRow = Math.floor(Math.random()*3);
            var regionColumn = Math.floor(Math.random()*3);
            var randomRow = Math.floor(Math.random()*3);
            var randomColumn = Math.floor(Math.random()*3);

            // Note as we want a random 2 out of 3, a single random and just adding 1 and modulo
            // is equilivent to randomly selecting any one of the combinations
            _swapRow(regionRow*3 + randomRow, regionRow*3 + ((randomRow+1)%3));
            _swapColumn(regionColumn*3 + randomColumn, regionColumn*3 + ((randomColumn+1)%3));
        }
    }

    function _swapRow(rowIndex1, rowIndex2) {
        var row1 = Utilities.getRow(sudokuBoard, rowIndex1);
        var row2 = Utilities.getRow(sudokuBoard, rowIndex2);
        Utilities.setRow(sudokuBoard, rowIndex2, row1);
        Utilities.setRow(sudokuBoard, rowIndex1, row2);
    }

    function _swapColumn(columnIndex1, columnIndex2) {
        var column1 = Utilities.getColumn(sudokuBoard, columnIndex1);
        var column2 = Utilities.getColumn(sudokuBoard, columnIndex2);
        Utilities.setColumn(sudokuBoard, columnIndex2, column1);
        Utilities.setColumn(sudokuBoard, columnIndex1, column2);
    }

    function _generateBoardFromSeed(seed) {
        // Determine if we're shifting up or down and left or right.
        var horizontalShift = (Math.random() > 0.5) ? -1 : 1;
        var verticalShift = (Math.random() > 0.5) ? -1 : 1;

        for(var regionIndex = 0; regionIndex < 9; regionIndex++) {
            // This could also be done by matrix multiplation of seed for each region
            // e.g. [0,1,0,  0,0,1,  1,0,0] one column offset and [0,1,0,  0,0,1,  1,0,0] one row offset
            for(var x = 0; x < 3; x++) {
                for(var y = 0; y < 3; y++) {
                    var index = x+3*(regionIndex%3) + (y+3*Math.floor(regionIndex/3))*9;
                    sudokuBoard.setValue(
                        x+3*(regionIndex%3),
                        y+3*Math.floor(regionIndex/3),
                        _getValueFromSeed(seed, regionIndex, x, y, horizontalShift, verticalShift));
                }
            }
        }
    }

    function _generateSeedRegion() {
        var region = []; // Length: 9, index by rows first, ribbons second
        for(var n = 1; n < 10; n++) {
            var placed = false;
            while(!placed) {
                var index = Math.floor(Math.random()*9);
                if(!region[index]) {
                    region[index] = n;
                    placed = true;
                }
            }
        }
        return region;
    }

    function _getValueFromSeed(seed, regionIndex, x, y, horizontalShift, verticalShift, index) {
        // Shift rows for region ribbons and ribbons for region rows
        var regionX = regionIndex%3;
        var regionY = Math.floor(regionIndex/3);
        var horizontalValue = x + regionY * horizontalShift;
        var verticalValue = y + regionX * verticalShift;
        if (horizontalValue < 0) { horizontalValue += 3; } // Compensate for negatives and overflows (should cycle) - can we use % easily here?
        if (verticalValue < 0) { verticalValue += 3; }
        if (horizontalValue > 2) { horizontalValue -= 3; }
        if (verticalValue > 2) { verticalValue -= 3; }
        return seed[horizontalValue + verticalValue*3];
    }

    return {
        generateBoard:	generateBoard
    }

}();