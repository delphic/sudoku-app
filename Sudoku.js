var Sudoku = function(){
// SudokuController
var Controller = function() {
    var solution;
    var puzzle;
    var highlight = false;
    var selectCellFirst = true;
    var pencilDown = false;
    var eraserDown = false;
    var selectedValue = 0;
    var selectedCell;

    $(document).ready(function() {
        init();
        bindButtons();
        View.drawPuzzle(puzzle);
    });

    function bindButtons() {
        for(var i=1; i<10; i++) {
            View.bindButton("btn"+i,(function(index) { return function() { selectNumber(index); }; }(i)));
        }

        View.bindButton("btnSelectCell", function() {
            selectCellFirst = !selectCellFirst;
            View.setButtonText("btnSelectCell", (selectCellFirst) ? "Cell then Value" : "Value then Cell");
            if(!selectCellFirst) { View.clearSelection(); }
        });
        View.bindButton("btnHighlight", function() {
            highlight = !highlight;
            View.setButtonText("btnHighlight", (highlight) ? "Disable Highlight" : "Enable Highlight");
            // TODO: Enable highlight
        });

        View.bindButton("btnPencil", function() {
            pencilDown = !pencilDown;
            View.setButtonText("btnPencil", (pencilDown) ? "Disable Pencil" : "Enable Pencil");
        });
        View.bindButton("btnEraser", function() {
            eraserDown = !eraserDown;
            View.setButtonText("btnEraser", (eraserDown) ? "Disable Eraser" : "Enable Eraser" );
        });
    }

    function selectCell(x,y) {
        selectedCell = [x, y];
        if(eraserDown) {
            setCellValue(0);
            selectedCell = null;
        } else {
            if(selectCellFirst) {
                if(!eraserDown) {
                    View.selectCell(x,y);
                }
            }
            // TODO: If cell then value && highlight, enable highlight on value of this cell
            if(!selectCellFirst && selectedValue) {
                if(!pencilDown) {
                    setCellValue(selectedValue);
                }
            }
        }
    }

    function selectNumber(value) {
        selectedValue = value;
        if(selectCellFirst && selectedCell) {
            setCellValue(value);
        }
    }

    function setCellValue(value) {
        // TODO: Check for conflicts, and do not set value and highlight them if found
        puzzle.setValue(selectedCell[0], selectedCell[1], value);
        View.updateCell(selectedCell[0], selectedCell[1], puzzle);
        // Value = 0 if erasing, do not select cell
        if(selectCellFirst && value) {
            View.selectCell(selectedCell[0], selectedCell[1]);
        }
    }

    function init() {
        solution = FullBoardGenerator.generateBoard();
        // TODO : Replace with Proper Sudoku Puzzle Generator !

        puzzle = PuzzleGenerator.Generate({ fullBoard: solution });

        /*
         puzzle = new SudokuBoard(solution);
         for(var n = 0; n < 20; n++) {
         var x = Math.floor(Math.random()*5);
         var y = Math.floor(Math.random()*9);
         puzzle.setValue(x,y,0);
         puzzle.setValue(8-x,8-y, 0);
         }
         puzzle.lock();
         */
    }

    return {
        selectCell: 	selectCell
    }
}();


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

var PuzzleGenerator = function() {
    // Method to Generate Puzzle of certain difficultly and certain number of removed items
    // TODO: Either Multiple Methods and parameters -> fullBoard, or more parameters
    function Generate(parameters) {
        var fullBoard = parameters.fullBoard;
        var puzzle = new SudokuBoard(fullBoard);
        var squaresToRemove = 20;
        var squaresRemoved = 0;
        var cache = [];

        // TODO: Make puzzle able to backtrack more than one
        while (squaresRemoved < squaresToRemove) {
            // TODO: Randomly only the first time, if fail proceed
            // If it gets back to initial value then backtrack further or throw error.
            var coords = _getUncachedCoords(cache);
            var x = coords[0];
            var y = coords[1];
            var cacheI = puzzle.getValue(x,y);
            var cacheJ = puzzle.getValue(8-x,8-y);
            puzzle.setValue(x,y,0);
            // This ensures the number you ask is removed (centre place is it's own rotationally symmetric pair).
            if(squaresToRemove-squaresRemoved > 1) {
                puzzle.setValue(8-x,8-y, 0);
            }

            Solver.setPuzzle(puzzle);
            if(!Solver.solve({})) {
                puzzle.setValue(x,y,cacheI);
                if(squaresToRemove-squaresRemoved > 1) {
                    puzzle.setValue(8-x,8-y,cacheJ);
                }
            } else {
                _setCache(cache, x, y);
                if((coords[0] === 4 && coords[1] === 4) || squaresToRemove - squaresRemoved === 1) {
                    squaresRemoved+=1;
                    console.log("Removed 1 square, total squares removed " + squaresRemoved);
                } else {
                    squaresRemoved+=2;
                    console.log("Removed 2 squares, total squares removed " + squaresRemoved);
                }
            }
        }

        puzzle.lock();

        return puzzle;
    }

    function _setCache(cache, x, y) {
        if(_checkCache(cache, x, y)) { throw new Error("Tried to cache value already cached.")}
        cache[x + "" + y + ""] = true;
    }

    function _checkCache(cache, x, y) {
        return cache[x + "" + y + ""];
    }

    function _getUncachedCoords(cache) {
        var found = false;
        while(!found) {
            var x = Math.floor(Math.random()*5);
            var y = Math.floor(Math.random()*9);
            if(!_checkCache(cache, x,y) && !_checkCache(cache, 8-x, 8-y)) {
                found = true;
            }
        }
        return [x, y];
    }

    return {
        Generate: Generate
    }
}();

// TODO: needs to use parameters of methods it can use to solve
var Solver = function() {
    var sudokuBoard;

    function getSolution() {
        var isSolvable;
        if(!sudokuBoard.isComplete()) {
            isSolvable = solve();
        }
        return (isSolvable) ? sudokuBoard : null;
    }

    function getCurrentBoard() {
        return new SudokuBoard(sudokuBoard);
    }

    function nextLogicalMove() {
        // BEWARE this function returns in many places
        // because I think it's more readable than a
        // million nested if statements
        if (sudokuBoard.isComplete()) {
            return { type: "Complete" };
        }

        // Single Position
        var singlePosition = _singlePosition();
        if(singlePosition) {
            //console.log("Single Position");
            return { type: "Add", coords: [singlePosition.coord], values: [singlePosition.value] };
        }

        // Check Pencil Marks
        var pencilMarkToRemove = _getPencilMarkToRemove();
        if(pencilMarkToRemove) {
            return { type: "RemovePencilMark", coords: [pencilMarkToRemove.coord], values: [pencilMarkToRemove.value] };
        }

        // Single Candidate
        var singleCandidate = _singleCandidate();
        if(singleCandidate) {
            //console.log("Single Candidate");
            return { type: "Add", coords: [singleCandidate.coord], values: [singleCandidate.value] };
        }

        // Onwards!

    }

    function setPuzzle(puzzle, useExistingPencilMarks) {
        sudokuBoard = new SudokuBoard(puzzle);
        if(!useExistingPencilMarks) {
            // NOTE: if using existing pencil marks they must be
            // ensured as valid against the known solution.
            _generatePencilMarks();
        }
    }

    function solve(parameters) {
        // Parameters to indicate required difficulty
        var moves = 0;
        while(_performNextLogicalMove()) {
            moves++;
        }

        if(sudokuBoard.isComplete()) {
            console.log("Solved Sudoku in " + moves + " moves.");
            return true;
        } else {
            console.log("Unable to Solve Sudoku");
            return false;
        }
    }

    function _performNextLogicalMove() {
        var move = nextLogicalMove();
        if(move) {
            // console.log move
            // Perform Move on Board (sudokuBoard)
            // See nextLogicalMove for format (type string, coords [], values [])
            switch(move.type) {
                case "Add":
                    console.log("Setting value " + move.values[0] + " at " + move.coords[0][0] + ", " + move.coords[0][1] + ".");
                    sudokuBoard.setValue(move.coords[0][0], move.coords[0][1], move.values[0]);
                    break;
                case "RemovePencilMark":
                    sudokuBoard.removePencilMark(move.coords[0][0], move.coords[0][1], move.values[0]);
                    console.log("Removing Pencil Mark " + move.values[0] + " at " + move.coords[0][0] + ", " + move.coords[0][1] + ".");
                    return false;
                    break;
                case "Complete":
                    console.log("No logical moves as board is complete");
                    return false;
                default:
                    console.log("Unrecognised Move.");
                    throw new Error("Unrecognised Move");
            }
            return true;
        }
        //console.log("No logical moves");
        return false;
    }

    // Looks for pencil marks can be removed
    // by checking for collisions with numbers
    // on the board already
    // returns { coord: [x,y], value: n }
    function _getPencilMarkToRemove() {
        for(var x = 0; x < 9; x++) {
            for(var y = 0; y < 9; y++) {
                if(!sudokuBoard.getValue(x,y)) {
                    var pencilMark = sudokuBoard.getPencilMark(x,y);
                    for(var n = 1; n < 10; n++) {
                        if(pencilMark[n] && (Utilities.columnHasValue(sudokuBoard, x, n) || Utilities.rowHasValue(sudokuBoard, y, n) || Utilities.regionHasValue(sudokuBoard, Utilities.getRegionIndex(x,y), n))) {
                            return { coord: [ x, y ], value: n };
                        }
                    }
                }
            }
        }
        return null;
    }

    // Writes all the possible pencil marks to the board
    function _generatePencilMarks() {
        for(var x = 0; x < 9; x++) {
            for(var y = 0; y < 9; y++) {
                if(!sudokuBoard.getValue(x,y)) {
                    for(var n = 1; n < 10; n++) {
                        if(!Utilities.columnHasValue(sudokuBoard, x, n) && !Utilities.rowHasValue(sudokuBoard, y, n) && !Utilities.regionHasValue(sudokuBoard, Utilities.getRegionIndex(x,y), n)) {
                            sudokuBoard.addPencilMark(x, y, n);
                        }
                    }
                }
            }
        }
    }

    function _singlePosition() {
        // For each row, column and region is there only a single square left?
        var value = 0;
        var singleSquare = false;
        for(var columnIndex = 0; columnIndex < 9; columnIndex++) {
            for(var n = 1; n < 10; n++) {
                if(!Utilities.columnHasValue(sudokuBoard, columnIndex, n)) {
                    if(!singleSquare) {
                        singleSquare = true;
                        value = n;

                    } else {
                        singleSquare = false;
                        break;
                    }
                }
            }
            if(singleSquare) {
                return {
                    coord: [columnIndex, Utilities.getYIndexForValueInColumn(sudokuBoard, columnIndex, 0)],
                    value: value
                };
            }
        }

        for(var rowIndex = 0; rowIndex < 9; rowIndex++) {
            for(n = 1; n < 10; n++) {
                if(!Utilities.rowHasValue(sudokuBoard, rowIndex, n)) {
                    if(!singleSquare) {
                        singleSquare = true;
                        value = n;
                    } else {
                        singleSquare = false;
                        break;
                    }
                }
            }
            if(singleSquare) {
                return {
                    coord: [Utilities.getXIndexForValueInRow(sudokuBoard, rowIndex, 0), rowIndex],
                    value: value
                };
            }
        }

        for(var regionIndex = 0; regionIndex < 9; regionIndex++) {
            for(n = 1; n < 10; n++) {
                if(!Utilities.regionHasValue(sudokuBoard, regionIndex, n)) {
                    if(!singleSquare) {
                        singleSquare = true;
                        value = n;
                    } else {
                        singleSquare = false;
                        break;
                    }
                }
            }
            if(singleSquare) {
                return {
                    coord: Utilities.getCoordForValueInRegion(sudokuBoard, regionIndex, 0),
                    value: value
                };
            }
        }

        return null;
    }

    function _singleCandidate() {
        for(var x = 0; x < 9; x++) {
            for(var y = 0; y < 9; y++) {
                if(!sudokuBoard.getValue(x,y)) {
                    var singlePencilMark = Utilities.singlePencilMark(sudokuBoard.getPencilMark(x,y));
                    if(singlePencilMark) {
                        return {
                            coord: [x,y],
                            value: singlePencilMark
                        }
                    }
                }
            }
        }
        return null;
    }

    return {
        nextLogicalMove:	nextLogicalMove,
        setPuzzle:          setPuzzle,
        solve: 				solve
    }
}();

function SudokuBoard(sudokuBoard) {
    // Pencil Marks
    this.getPencilMark = function(x, y) {
        return pencilMarks[x + 9*y].slice(0);
    }
    this.addPencilMark = function(x, y, value) {
        if(value === 0) { return; }
        pencilMarks[x + 9*y][value] = true;
        pencilMarks[x + 9*y][0] = false;
    }
    this.removePencilMark = function(x, y, value) {
        var index = x + 9*y;
        var blank = true;
        pencilMarks[index][value] = false;
        for(var key in pencilMarks[index]) {
            if(pencilMarks[index].hasOwnProperty(key)) {
                if(pencilMarks[index][key]) { blank = false; }
            }
        }
        if(blank) { pencilMarks[index][0] = true; }
    }
    this.addPencilMarks = function(x, y, values) {
        pencilMarks[x + 9*y][0] = true;
        for(var key in values) {
            if(values.hasOwnProperty(key) && !isNaN(values[key]) && values[key] < 10 && values[key] > 0) {
                pencilMarks[x + 9*y][values[key]] = true;
                pencilMarks[x + 9*y][0] = false;
            }
        }
    }

    // Disabled
    this.isDisabled = function(x, y) {
        return disabled[x + 9*y];
    }
    this.lock = function() {
        for(var m = 0; m < 81; m++) {
            if(board[m]) {
                disabled[m] = true;
            }
        }
        locked = true;
    }

    // Is Complete
    this.isComplete = function() {
        for(var n = 0; n < 81; n++) {
            if(!board[n]) { return false; }
        }
        return true;
    }

    // Get / Set Values
    this.getValue = function(x, y) {
        return board[x + 9*y];
    }
    this.setValue = function(x, y, value) {
        if (!(locked && this.isDisabled(x,y))) {
            board[x + 9*y] = value;
        }
    }

    // Board is numbered so first row is 0-8,
    // second is 9-17 etc, 'squares' are the nine
    // by nine blocks, the first row being 0-2,
    // the second 3-5, and third 6-8.
    var board = [];

    // Pencil marks are numbers as the board, each
    // contains an array length 10, the [0] = true
    // implies not set, [#] = true implies a pencil
    // mark for number #.
    var pencilMarks = [];

    // Disabled squares are those given at the start
    // of a puzzle and therefore cannot be changed
    // indexed as per board and pencil marks
    var locked = false;
    var disabled = [];

    var emptyPencilMark = [];

    for(i = 0; i < 10; i++) {
        emptyPencilMark[i] = (i === 0) ? true : false;
    }

    for(var i = 0; i < 81; i++) {
        board.push(0);
        pencilMarks.push(emptyPencilMark.slice(0));
        disabled.push(false);
    }

    if(sudokuBoard) {
        for(var x = 0; x < 9; x++) {
            for(var y = 0; y < 9; y++) {
                this.setValue(x, y, sudokuBoard.getValue(x,y));
                pencilMarks[x + 9*y] = sudokuBoard.getPencilMark(x,y);
            }
        }
    }
};

var Utilities = function() {
    function getRow(puzzle, rowIndex) {
        var row = [];
        for(var i = 0; i < 9; i++) {
            row[i] = puzzle.getValue(i,rowIndex);
        }
        return row;
    }

    function setRow(puzzle, rowIndex, row) {
        for(var i=0; i < 9; i++) {
            puzzle.setValue(i, rowIndex, row[i]);
        }
    }

    function getColumn(puzzle, columnIndex) {
        var column = [];
        for(var j=0; j < 9; j++) {
            column[j] = puzzle.getValue(columnIndex, j);
        }
        return column;
    }

    function setColumn(puzzle, columnIndex, column) {
        for(var j=0; j < 9; j++) {
            puzzle.setValue(columnIndex, j, column[j]);
        }
    }

    function getRegionIndex(x,y) {
        return Math.floor(x/3) + Math.floor(y/3)*3;
    }

    // Get Index for Value
    function getXIndexForValueInRow(puzzle, rowIndex, value) {
        var index;
        for(var x=0; x < 9; x++) {
            if(puzzle.getValue(x, rowIndex) === value) {
                index = x;
                break;
            }
        }
        return index;
    }

    function getYIndexForValueInColumn(puzzle, columnIndex, value) {
        var index;
        for(var y=0; y < 9; y++) {
            if(puzzle.getValue(columnIndex, y) === value) {
                index = y;
                break;
            }
        }
        return index;
    }

    function getCoordForValueInRegion(puzzle, regionIndex, value) {
        var coords;
        var x,y;
        for(var i=0; i < 3; i++) {
            for(var j=0; j < 3; j++) {
                x = (regionIndex%3)*3+i;
                y = Math.floor(regionIndex/3)*3+j;
                if(puzzle.getValue(x,y) === value) {
                    coords = [x,y];
                    break;
                }
            }
        }
        return coords;
    }

    // Has Value Checks
    function columnHasValue(puzzle, columnIndex, value) {
        for(var y = 0; y < 9; y++) {
            if(puzzle.getValue(columnIndex, y) === value) {
                return true;
            }
        }
        return false;
    }

    function rowHasValue(puzzle, rowIndex, value) {
        for(var x = 0; x < 9; x++) {
            if(puzzle.getValue(x, rowIndex) === value) {
                return true;
            }
        }
        return false;
    }

    function regionHasValue(puzzle, squareIndex, value) {
        var columnIndex = (squareIndex%3 === 0) ? 0 : ((squareIndex-1)%3 === 0) ? 3 : 6;
        var rowIndex = (squareIndex < 3) ? 0 : (squareIndex < 6) ? 3 : 6;
        for(var x = 0; x < 3; x++) {
            for(var y = 0; y < 3; y++) {
                if(puzzle.getValue(columnIndex+x, rowIndex+y) === value) {
                    return true;
                }
            }
        }
        return false;
    }

    // Pencil Marks
    function singlePencilMark(pencilMark) {
        var result = 0;
        // If not noted as blank
        if(!pencilMark[0]) {
            // Check each value
            for(var n = 1; n < 10; n++) {
                if(pencilMark[n]) {
                    if (!result) {
                        // Set result to pencil mark if found and first result found
                        result = n;
                    } else {
                        // More than a single mark, return 0
                        return 0;
                    }
                }
            }
        }
        return result;
    }

    return {
        getRow: getRow,
        setRow: setRow,
        getColumn: getColumn,
        setColumn: setColumn,
        getXIndexForValueInRow: getXIndexForValueInRow,
        getYIndexForValueInColumn: getYIndexForValueInColumn,
        getCoordForValueInRegion: getCoordForValueInRegion,
        columnHasValue: columnHasValue,
        rowHasValue: rowHasValue,
        regionHasValue: regionHasValue,
        getRegionIndex: getRegionIndex,
        singlePencilMark: singlePencilMark
    }
}();

// SudokuValidator
// Needs puzzle and solution
// Will check if an entry is invalid against puzzle
// Will check if an entry is incorrect against solution
// Will check if pencil marks are invalid against puzzle
// Will check if pencil marks are missing against solution

var Validator = function() {
}();

// SudokuView
// Will carry out the changes to the view presentation of the board
// request by the controller, for now it will probably just redraw
// the board each time, but we will have separate functions for each
// request in order to facilitate optimisation at a later date
var View = function(){
    var ZenHtml = function() {
        function getBoardHtml(sudokuBoard) {
            var tableHtml = "<table>";
            for(var y = 0; y < 9; y++) {
                tableHtml += "<tr class='r"+y+"'>";
                for(var x = 0; x < 9; x++) {
                    var value = sudokuBoard.getValue(x,y);
                    var disabled = sudokuBoard.isDisabled(x,y);
                    tableHtml += "<td class=\"c" + x + " " + ((disabled) ? "disabled" : "")  + "\" " + ((disabled) ? "" : _onClickJs(x,y)) + " >";
                    if(value) {
                        tableHtml += value;
                    } else {
                        tableHtml += _getPencilMarkHtml(sudokuBoard.getPencilMark(x,y));
                    }
                    tableHtml += "</td>";
                }
                tableHtml += "</tr>";
            }
            tableHtml += "</table>";
            return tableHtml;
        }

        function _onClickJs(x,y) {
            return "onclick=\"Sudoku.Controller.selectCell(" + x + "," + y + ");\"";
        }

        function _getPencilMarkHtml(pencilMark) {
            var html = "";
            if(!pencilMark[0]) {
                html += "<table>";
                for(var y=0; y < 3; y++) {
                    html += "<tr>";
                    for(var x=0; x < 3; x++) {
                        var number = 1 + x + y*3;
                        html += "<td>";
                        html += (pencilMark[number]) ? number : "";
                        html += "</td>";
                    }
                    html += "</tr>";
                }
                html += "</table>";
            }
            return html;
        }

        return {
            getBoardHtml: getBoardHtml
        }
    }();

    function bindButton(id, command) {
        $("#"+id).click(command);
    }

    function clearSelection() {
        $(".selected").removeClass("selected");
    }

    function drawPuzzle(puzzle) {
        $('.container').html(ZenHtml.getBoardHtml(puzzle));
    }

    function setButtonText(id, text) {
        $("#"+id).html(text);
    }

    function selectCell(x, y) {
        $(".selected").removeClass("selected");
        $(".r"+y+" .c"+x).addClass("selected");
    }

    function updateCell(x, y, puzzle) {
        drawPuzzle(puzzle);
    }

    return {
        bindButton: bindButton,
        clearSelection: clearSelection,
        drawPuzzle: drawPuzzle,
        selectCell: selectCell,
        setButtonText: setButtonText,
        updateCell: updateCell
    }
}();

return {Controller:Controller,FullBoardGenerator:FullBoardGenerator,PuzzleGenerator:PuzzleGenerator,Solver:Solver,Utilities:Utilities,Validator:Validator,View:View};
}();
