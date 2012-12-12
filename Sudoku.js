var Sudoku = function(){
// SudokuController
var Controller = function() {
    var solution;
    var puzzle;
    var highlight = false;
    var highlightedValue = 0;
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
            if(!selectCellFirst) {
                selectedCell = null;
                View.clearSelection();
            }
        });
        View.bindButton("btnHighlight", function() {
            highlight = !highlight;
            View.setButtonText("btnHighlight", (highlight) ? "Disable Highlight" : "Enable Highlight");
            if(highlight && (highlightedValue || selectedValue)) {
                if(!highlightedValue) { highlightedValue = selectedValue; }
                View.highlight(Utilities.getCoordinatesForValue(puzzle, highlightedValue));
            } else if (!highlight) {
                View.clearHighlight();
            }
        });
        View.bindButton("btnPencil", function() {
            pencilDown = !pencilDown;
            View.setButtonText("btnPencil", (pencilDown) ? "Disable Pencil" : "Enable Pencil");
        });
        // TODO: Fix this w.r.t cell then value (just erase) or value then sell (eraser enabled)
        View.bindButton("btnEraser", function() {
            eraserDown = !eraserDown;
            selectedValue = 0;
            if(selectCellFirst) { selectNumber(0); }
            View.setButtonText("btnEraser", (eraserDown) ? "Disable Eraser" : "Enable Eraser" );
        });
    }

    function touchCell(x,y) {
        var cellValue = puzzle.getValue(x,y);
        // TODO: If Cell is not locked
        if(selectCellFirst) {
            // Select Cell First Mode
            if(selectedCell && selectedCell[0] === x && selectedCell[1] === y) {
                // Deselect Cell
                selectedCell = null;
            } else {
                // Select Cell
                selectedCell = [x,y];
                // Add Highlight if there is a value
                if(cellValue) {
                    highlightedValue = cellValue;
                }
            }
        } else {
            // Select Value First Mode
            if(selectedValue) {
                if(!pencilDown) {
                    // Pencil Not Down
                    if (selectedValue === cellValue) {
                        // Clear Value
                        puzzle.setValue(x, y, 0);
                    } else {
                        // TODO: Is Value Valid?
                        puzzle.setValue(x, y, selectedValue);
                    }
                } else {
                    // Pencil is Down
                    if(Utilities.pencilMarkContains(puzzle.getPencilMark(x,y),selectedValue)) {
                        // Clear Value
                        puzzle.removePencilMark(x,y,selectedValue);
                    } else {
                        // TODO: Is Pencil Mark Valid?
                        puzzle.addPencilMark(x,y,selectedValue);
                    }
                }
            } else if (eraserDown) {
                // Remove Value
                puzzle.setValue()
            } else {
                // Highlight value in cell
                highlightedValue = cellValue;
            }
        }
        // TODO: Else toggle highlight for value
        // Update View
        View.updateCell(x,y,puzzle);
        if(selectedCell) {
            View.selectCell(x,y);
        } else {
            View.clearSelection();
        }
        if (highlight) {
            View.clearHighlight();
            View.highlight(Utilities.getCoordinatesForValue(puzzle, highlightedValue));
        }

    }

     function selectNumber(value) {
         selectedValue = value;
         highlightedValue = value;
         if(selectCellFirst && selectedCell) {
             var x = selectedCell[0], y = selectedCell[1];
            if(!pencilDown) {
                puzzle.setValue(x, y, value);
            } else {
                // Pencil is Down
                if(Utilities.pencilMarkContains(puzzle.getPencilMark(x,y),value)) {
                    // Clear Value
                    puzzle.removePencilMark(x, y, value);
                } else {
                    // TODO: Is Pencil Mark Valid?
                    puzzle.addPencilMark(x, y, value);
                }
            }
            // Update View
            View.updateCell(x,y,puzzle);
         }
         if (highlight) {
            View.highlight(Utilities.getCoordinatesForValue(puzzle, highlightedValue));
        }
    }

    function init() {
        solution = FullBoardGenerator.generateBoard();
        puzzle = PuzzleGenerator.Generate({ fullBoard: solution });
    }

    return {
        touchCell: 	touchCell
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

        // Candidate Lines
        var pencilMarksToRemove = _candidateLines();
        if(pencilMarksToRemove) {
            return { type: "CandidateLines", coords: pencilMarksToRemove.coords, values:  [ pencilMarksToRemove.value ] };
        }

        // Multiple Lines
        pencilMarksToRemove = _multipleLines();
        if(pencilMarksToRemove) {
            return { type: "MultipleLines", coords: pencilMarksToRemove.coords, values: [ pencilMarksToRemove.value ] };
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
                    return true;
                    break;
                case "RemovePencilMark":
                    sudokuBoard.removePencilMark(move.coords[0][0], move.coords[0][1], move.values[0]);
                    console.log("Removing Pencil Mark " + move.values[0] + " at " + move.coords[0][0] + ", " + move.coords[0][1] + ".");
                    break;
                case "CandidateLines":
                    console.log("Candidate Lines Found")
                    for(var n = 0; n < move.coords.length; n++) {
                        sudokuBoard.removePencilMark(move.coords[n][0], move.coords[n][1], move.values[0]);
                        console.log("Removing Pencil Mark " + move.values[0] + " at " + move.coords[m][0] + ", " + move.coords[m][1] + ".");
                    }
                    break;
                case "Complete":
                    console.log("No logical moves as board is complete");
                    break;
                default:
                    console.log("Unrecognised Move.");
                    throw new Error("Unrecognised Move");
            }
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

    function _candidateLines() {
        // Returns { coords: [array of coordinates], value: value } or null
        // For each number
        for(var n = 1; n < 9; n++) {
            // For each region
            for(var region = 0; region < 9; region++) {
                // Do marks for this number exist in only one column
                var result = false;
                var marksFound = false;
                var localColumnIndex = 0;
                for(var y = 0; y < 3; y++) {
                    if(Utilities.columnInRegionHasPencilMark(sudokuBoard, region, y, n)) {
                        if(marksFound) {
                            result = false;
                            break;
                        } else  {
                            marksFound = true;
                            result = true;
                            localColumnIndex = y;
                        }
                    }
                }
                // If yes, does that column have any other marks of this type
                var otherRegionsHavePencilMark = false;
                for(var r = 0; r < 9; r++) {
                    if(Utilities.getY(r, localColumnIndex) === Utilities.getY(region, localColumnIndex) && r !== region) {
                        if(Utilities.columnInRegionHasPencilMark(sudokuBoard, r, localColumnIndex, n)) {
                            otherRegionsHavePencilMark = true;
                            break;
                        }
                    }
                }

                if(result && otherRegionsHavePencilMark) {
                    // Return the marks that are not in region
                    var coords = [];
                    var marksInColumn = Utilities.getCoordsForPencilMarkInColumnByRegion(sudokuBoard, Utilities.getY(region, localColumnIndex), n);
                    for(var q = 0; q < marksInColumn.length; q++) {
                        if(marksInColumn[q].region !== region) {
                            coords.push(marksInColumn.coord);
                        }
                    }
                    return { coords: coords, value: n };
                }

                // Do marks for this number exist in only one row
                result = false;
                marksFound = false;
                var localRowIndex = 0;
                for(var x = 0; x < 3; x++) {
                    if(Utilities.rowInRegionHasPencilMark(sudokuBoard, region, x, n)) {
                        if (marksFound) {
                            result = false;
                            break;
                        } else {
                            marksFound = true;
                            result = true;
                            localRowIndex = Utilities.getX(region, x);
                        }
                    }
                }

                // If yes, does that row have any other marks of this type
                otherRegionsHavePencilMark = false;
                for(r = 0; r < 9; r++) {
                    if(Utilities.getX(r, localRowIndex) === Utilities.getY(region, localRowIndex) && r !== region) {
                        if(Utilities.rowInRegionHasPencilMark(sudokuBoard, r, localRowIndex, n)) {
                            otherRegionsHavePencilMark = true;
                            break;
                        }
                    }
                }

                if(result && otherRegionsHavePencilMark) {
                    // Return the marks that are not in region
                    coords = [];
                    var marksInRow = Utilities.getCoordsForPencilMarkInRowByRegion(sudokuBoard, Utilities.getX(region, localRowIndex), n);
                    for(q = 0; q < marksInRow.length; q++) {
                        if(marksInRow[q].region !== region) {
                            coords.push(marksInColumn.coord);
                        }
                    }
                    return { coords: coords, value: n };
                }
            }
        }
        return null;
    }

    function _multipleLines() {
        // Returns { coords: [array of coordinates], value: value } or null
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

    /// Gets region index from board indices
    /// 0 -> 9, reading left to right, top to bottom
    function getRegionIndex(x,y) {
        return Math.floor(x/3) + Math.floor(y/3)*3;
    }

    /// Takes region index and region row index
    /// returns board row index
    function getX(r, i) {
        return r%3 + i;
    }

    /// Takes region index and region column index
    /// returns board column index
    function getY(r, j) {
        return Math.floor(r/3) + j;
    }

    function getCoordinatesForValue(puzzle, value) {
        var cells = [];
        for(var x = 0; x < 9; x++) {
            for(var y = 0; y < 9; y++) {
                if (puzzle.getValue(x,y) === value) {
                    cells.push([x,y]);
                }
            }
        }
        return cells;
    }

    /// Get Index for Value
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
        var columnIndex = _baseColumnIndexForRegion(squareIndex);
        var rowIndex = _baseRowIndexForRegion(squareIndex);
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
    function columnHasPencilMark(puzzle, columnIndex, value) {
       for(var x = 0; x < 9; x++) {
           if(pencilMarkContains(puzzle.getPencilMark(x, columnIndex), value)) {
               return true;
           }
       }
       return false;
    }

    function columnInRegionHasPencilMark(puzzle, squareIndex, localColumnIndex, value) {
        var columnIndex = _baseColumnIndexForRegion(squareIndex);
        var rowIndex = _baseRowIndexForRegion(squareIndex);
        for(var x = 0; x < 3; x++) {
            if(pencilMarkContains(puzzle.getPencilMark(rowIndex+x, columnIndex+localColumnIndex), value)) {
                return true;
            }
        }
        return false;
    }

    function rowHasPencilMark(puzzle, rowIndex, value) {
        for(var y = 0; y < 9; y++) {
            if(pencilMarkContains(puzzle.getPencilMark(rowIndex, y), value)) {
                return true;
            }
        }
        return false;
    }

    function rowInRegionHasPencilMark(puzzle, squareIndex, localRowIndex, value) {
        var columnIndex = _baseColumnIndexForRegion(squareIndex);
        var rowIndex = _baseRowIndexForRegion(squareIndex);
        for(var y = 0; y < 3; y++) {
            if(pencilMarkContains(puzzle.getPencilMark(rowIndex+localRowIndex, columnIndex+y), value)) {
                return true;
            }
        }
        return false;
    }

    function getCoordsForPencilMarkInColumnByRegion(puzzle, columnIndex, value) {
        var result = [];
        for(var x = 0; x < 9; x++) {
            if(pencilMarkContains(puzzle.getPencilMark(x, columnIndex), value)) {
                result.push({ coord: [x , columnIndex], region: getRegionIndex(x, columnIndex) });
            }
        }
        return result;
    }

    function getCoordsForPencilMarkInRowByRegion(puzzle, rowIndex, value) {
        var result = [];
        for(var y = 0; y < 9; y++) {
            if(pencilMarkContains(puzzle.getPencilMark(rowIndex, y), value)) {
                result.push({ coord: [rowIndex, y], region: getRegionIndex(rowIndex, y) });
            }
        }
        return result;
    }

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

    function pencilMarkContains(pencilMark, value) {
        return (!pencilMark[0] && pencilMark[value]);
    }

    // Private Functions
    function _baseColumnIndexForRegion(squareIndex) {
        return (squareIndex%3 === 0) ? 0 : ((squareIndex-1)%3 === 0) ? 3 : 6;
    }

    function _baseRowIndexForRegion(squareIndex) {
        return (squareIndex < 3) ? 0 : (squareIndex < 6) ? 3 : 6;
    }

    return {
        getX: getX,
        getY: getY,
        getRow: getRow,
        setRow: setRow,
        getColumn: getColumn,
        setColumn: setColumn,
        getCoordinatesForValue: getCoordinatesForValue,
        getXIndexForValueInRow: getXIndexForValueInRow,
        getYIndexForValueInColumn: getYIndexForValueInColumn,
        getCoordForValueInRegion: getCoordForValueInRegion,
        columnHasValue: columnHasValue,
        columnHasPencilMark: columnHasPencilMark,
        columnInRegionHasPencilMark: columnInRegionHasPencilMark,
        rowHasValue: rowHasValue,
        rowHasPencilMark: rowHasPencilMark,
        rowInRegionHasPencilMark: rowInRegionHasPencilMark,
        regionHasValue: regionHasValue,
        getRegionIndex: getRegionIndex,
        getCoordsForPencilMarkInColumnByRegion: getCoordsForPencilMarkInColumnByRegion,
        getCoordsForPencilMarkInRowByRegion: getCoordsForPencilMarkInRowByRegion,
        singlePencilMark: singlePencilMark,
        pencilMarkContains: pencilMarkContains
    }
}();

// SudokuValidator
var Validator = function() {
    var Validation = {};
    Validation.MultipleEntriesInRow = "EntriesInRow";
    Validation.MultipleEntriesInColumn = "EntriesInColumn";
    Validation.MultipleEntriesInRegion = "EntriesInRegion";
    Validation.InvalidPencilMark = "InvalidPencilMark";
    Validation.IncorrectValue = "IncorrectValue";
    Validation.MissingPencilMark = "MissingPencilMark";

    // Check if an entry is invalid against puzzle
    // Returns [{ value, coords, type }] if there are clash(s), null otherwise
    function validatePuzzleEntries(puzzle) {
        var results = [];
        var x, y, i, j, rx, ry, value;
        var cache = [];

        // Check Rows
        for(x = 0; x < 9; x++) {
            for(y = 0; y < 9; y++) {
                value = puzzle.getValue(x, y);
                if(value) {
                    if(cache[value]) {
                        results.push({
                            value: value,
                            coords: [cache[value], [x, y]],
                            type: Validation.MultipleEntriesInRow
                        });
                    } else {
                        cache[value] = [x,y];
                    }
                }
            }
            cache = [];
        }

        // Check Columns
        for(y = 0; y < 9; y++) {
            for(x = 0; x < 9; x++) {
                value = puzzle.getValue(x, y);
                if(value) {
                    if(cache[value]) {
                        results.push({
                            value: value,
                            coords: [cache[value], [x,y]],
                            type: Validation.MultipleEntriesInColumn
                        });
                    } else {
                        cache[value] = [x, y];
                    }
                }
            }
            cache = [];
        }

        // Check Regions
        for(rx = 0; rx < 3; rx++) {
            for(ry = 0; ry < 3; ry++) {
                for(i = 0; i< 3; i++) {
                    for(j = 0; j < 3; j++) {
                        x = rx*3 + i;
                        y = ry*3 + j;
                        value = puzzle.getValue(x,y);
                        if(value) {
                            if(cache[value]) {
                                results.push({
                                    value: value,
                                    coords: [cache[value], [x,y]],
                                    type: Validation.MultipleEntriesInRegion
                                });
                            } else {
                                cache[value] = [x, y];
                            }
                        }
                    }
                }
                cache = [];
            }
        }

        return results.length > 0 ? results : null;
    }

    // Check if pencil marks are invalid against puzzle
    // Returns [{ value, valueCoord, pencilMarkCoord, type }] or null
    function validatePuzzlePencilMarks(puzzle) {
        // For each number x, y, check pencil marks in row column and region
        var results = [];
        var x, y, i, j, r, value;
        for(x = 0; x < 9; x++) {
            for(y =0; y < 9; y++) {
                value = puzzle.getValue(x,y);
                if(value) {
                    // Check Row
                    for(i = 0; i < 9; i++) {
                        if(!puzzle.getValue(i,y)) {
                            if (Utilities.pencilMarkContains(puzzle.getPencilMark(i,y), value)) {
                                results.push({
                                    value: value,
                                    valueCoord: [x,y],
                                    pencilMarkCoord: [i,y],
                                    type: Validation.InvalidPencilMark
                                });
                            }
                        }
                    }
                    // Check Column
                    for(j = 0; j < 9; j++) {
                        if(!puzzle.getValue(x,j)) {
                            console.log("Checking " + x + ", " + j + "pencil marks");
                            if(Utilities.pencilMarkContains(puzzle.getPencilMark(x,j), value)) {
                                results.push({
                                    value: value,
                                    valueCoord: [x,y],
                                    pencilMarkCoord: [x,j],
                                    type: Validation.InvalidPencilMark
                                });
                            }
                        }
                    }
                    // Check Region
                    r = Utilities.getRegionIndex(x,y);
                    for(i = 0; i < 3; i++) {
                        for(j = 0; j < 3; j++) {
                            if(!puzzle.getValue(Utilities.getX(r, i), Utilities.getY(r, j))) {
                                if(Utilities.pencilMarkContains(puzzle.getPencilMark(Utilities.getX(r, i), Utilities.getY(r, j)), value)) {
                                    results.push({
                                        value: value,
                                        valueCoord: [x,y],
                                        pencilMarkCoord: [Utilities.getX(r, i), Utilities.getY(r, j)],
                                        type: Validation.InvalidPencilMark
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        return results.length > 0 ? results : null;
    }

    // Check if an entry is incorrect against solution
    // Returns { coord, type } or null
    function validateAgainstSolution(puzzle, solution) {
        var x, y;
        for(x = 0; x < 9; x++) {
            for(y = 0; y < 9; y++) {
                if(puzzle.getValue(x,y)) {
                    if(puzzle.getValue(x,y) !== solution.getValue(x,y)) {
                        return {
                            coord: [x, y],
                            type: Validation.IncorrectValue
                        };
                    }
                }
            }
        }
        return null;
    }

    // Check if pencil marks are missing against solution
    // Returns { value, coord, type } or null
    function validatePencilMarksAgainstSolution(puzzle, solution) {
        var x, y;
        for(x = 0; x < 9; x++) {
            for(y = 0; y < 9; y++) {
                if(!puzzle.getValue(x,y)) {
                    if(!Utilities.pencilMarkContains(puzzle.getPencilMark(x,y), solution.getValue(x,y))) {
                        return {
                            value: solution.getValue(x,y),
                            coord: [x,y],
                            type: Validation.MissingPencilMark
                        };
                    }
                }
            }
        }
        return null;
    }

    return {
        validatePuzzleEntries: validatePuzzleEntries,
        validatePuzzlePencilMarks: validatePuzzlePencilMarks,
        validateAgainstSolution: validateAgainstSolution,
        validatePencilMarksAgainstSolution: validatePencilMarksAgainstSolution
    }
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
            return "onclick=\"Sudoku.Controller.touchCell(" + x + "," + y + ");\"";
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

    function clearHighlight() {
        $(".highlight").removeClass("highlight");
    }

    function clearSelection() {
        $(".selected").removeClass("selected");
    }

    function drawPuzzle(puzzle) {
        $('.container').html(ZenHtml.getBoardHtml(puzzle));
    }

    function highlight(cells) {
        clearHighlight();
        for(var i = 0; i < cells.length; i++) {
            $(".r"+cells[i][1]+" .c"+cells[i][0]).addClass("highlight");
        }
    }

    function highlightPencilMarks(cells, value) {
        // Highlight the appropriate cell
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
        clearHighlight: clearHighlight,
        clearSelection: clearSelection,
        drawPuzzle: drawPuzzle,
        highlight: highlight,
        selectCell: selectCell,
        setButtonText: setButtonText,
        updateCell: updateCell
    }
}();

var Tests = function(){
// Should probably be using a proper framework e.g. QUnit
var ValidatorTests = function(){
    var Tests = [];

    var fullBoard = FullBoardGenerator.generateBoard();

    // Test validatePuzzleEntries
    // Separate tests for row, column and region
    // Returns [{ value, coords, type }] if there's a clash, null otherwise

    function _anyValuesMatch(results, expectedValue) {
        for(var i = 0; i < results.length; i++) {
            if(results[i].value === expectedValue) {
                return true;
            }
        }
        return false;
    }

    function _anyCoordsMatch(results, expectedCoords) {
        for(var i = 0; i < results.length; i++) {
            var actualCoords = results[i].coords;
            if(actualCoords.toString() === expectedCoords.toString() || [actualCoords[1],actualCoords[0]].toString() === expectedCoords.toString()) {
                return true;
            }
        }
        return false;
    }

    var validatePuzzleEntriesFullBoardTest = function() {
        var testName = "Validate Puzzle Entries, Full Board";
        if (Validator.validatePuzzleEntries(fullBoard) === null) {
            return { testName: testName, result: true };
        } else {
            return { testName: testName, message: "Unexpected result expected null", result: false };
        }
    };
    Tests.push(validatePuzzleEntriesFullBoardTest);

    var validatePuzzleEntriesRowClashTest = function() {
        var testName = "Validate Puzzle Entries, Row Clash";
        var boardClash = new SudokuBoard(fullBoard);
        var value = boardClash.getValue(5,0)
        boardClash.setValue(0, 0, value);
        var validationResult = Validator.validatePuzzleEntries(boardClash);
        if(validationResult === null) {
            return { testName: testName, message: "Validation result was null, expected clash at [0,0], [5,0]", result: false, board: _boardString(boardClash) };
        } else if (!_anyValuesMatch(validationResult, value)) {
            return { testName: testName, message: "Validation result did not contain value " + value + ", validation result was " + JSON.stringify(validationResult), result: false, board: _boardString(boardClash) };
        } else if (!_anyCoordsMatch(validationResult, [[0,0],[5,0]])) {
            return { testName: testName, message: "Validation result did not contain expected coordinates " + [[0,0],[5,0]] + ", validation result was " + JSON.stringify(validationResult), result: false, board: _boardString(boardClash) };
        }
        return { testName: testName, result: true };
    };
    Tests.push(validatePuzzleEntriesRowClashTest);

    var validatePuzzleEntriesColumnClashTest = function() {
        var testName = "Validate Puzzle Entries, Column Clash";
        var boardClash = new SudokuBoard(fullBoard);
        var value = boardClash.getValue(0,6)
        boardClash.setValue(0, 0, value);
        var validationResult = Validator.validatePuzzleEntries(boardClash);
        if(validationResult === null) {
            return { testName: testName, message: "Validation Result was null, expected clash at [0,0], [0,6]", result: false, board: _boardString(boardClash) };
        } else if (!_anyValuesMatch(validationResult, value)) {
            return { testName: testName, message: "Validation result did not contain value " + value + ", validation result was " + JSON.stringify(validationResult), result: false, board: _boardString(boardClash) };
        } else if (!_anyCoordsMatch(validationResult, [[0,0],[0,6]])) {
            return { testName: testName, message: "Validation result did not contain expected coordinates " + [[0,0],[0,6]] + ", validation result was " + JSON.stringify(validationResult), result: false, board: _boardString(boardClash) };
        }
        return { testName: testName, result: true };
    };
    Tests.push(validatePuzzleEntriesColumnClashTest);

    var validatePuzzleEntriesRegionClashTest = function() {
        var testName = "Validate Puzzle Entries, Region Clash";
        var boardClash = new SudokuBoard(fullBoard);
        var value = boardClash.getValue(1,1)
        boardClash.setValue(0, 0, value);
        var validationResult = Validator.validatePuzzleEntries(boardClash);
        if(validationResult === null) {
            return { testName: testName, message: "Validation Result was null, expected clash at [0,0], [1,1]", result: false, board: _boardString(boardClash) };
        } else if (!_anyValuesMatch(validationResult, value)) {
            return { testName: testName, message: "Validation result did not contain value " + value + ", validation result was " + JSON.stringify(validationResult), result: false, board: _boardString(boardClash) };
        } else if (!_anyCoordsMatch(validationResult, [[0,0],[1,1]])) {
            return { testName: testName, message: "Validation result did not contain expected coordinates " + [[0,0],[1,1]] + ", validation result was " + JSON.stringify(validationResult), result: false, board: _boardString(boardClash) };
        }
        return { testName: testName, result: true};
    };
    Tests.push(validatePuzzleEntriesRegionClashTest);

    // Test validatePuzzlePencilMarks
    // Returns [{ value, valueCoord, pencilMarkCoord, type }] or null

    function _anyPencilMarkValuesMatch(results, expectedValue) {
        for(var i = 0, l = results.length; i < l; i++) {
            if(results[i].value === expectedValue) {
                return true;
            }
        }
        return false;
    }
    function _anyValueCoordMatch(results, expectedCoordinates) {
        for(var i = 0, l = results.length; i < l; i++) {
            if(results[i].valueCoord.toString() === expectedCoordinates.toString()) {
                return true;
            }
        }
        return false;
    }
    function _anyPencilMarkCoordMatch(results, expectedCoordinates) {
        for(var i = 0, l = results.length; i < l; i++) {
            if(results[i].pencilMarkCoord.toString() === expectedCoordinates.toString()) {
                return true;
            }
        }
        return false;
    }

    var validatePuzzlePencilMarksValidTest = function() {
        var testName = "Validate Pencil Marks, Valid Mark";
       // Remove 3 numbers place pencil marks
        var testBoard = new SudokuBoard(fullBoard);
        var value = testBoard.getValue(0,0);
        testBoard.setValue(0,0,0);
        testBoard.addPencilMark(0,0,value);
        value = testBoard.getValue(3,3);
        testBoard.setValue(3,3,0);
        testBoard.addPencilMark(3,3,value);
        value = testBoard.getValue(6,6);
        testBoard.setValue(6,6,0);
        testBoard.addPencilMark(6,6,value);

        if (Validator.validatePuzzlePencilMarks(fullBoard) === null) {
            return { testName: testName, result: true };
        } else {
            return { testName: testName, message: "Unexpected result expected null", result: false, board: _boardString(testBoard) };
        }
    };
    Tests.push(validatePuzzlePencilMarksValidTest);

    var validatePuzzlePencilMarksRowTest = function() {
        var testName = "Validate Pencil Marks, Row Test"
        var testBoard = new SudokuBoard(fullBoard);
        var value = testBoard.getValue(5,0);
        testBoard.setValue(0,0,0);
        testBoard.addPencilMark(0,0,value);
        var validationResult = Validator.validatePuzzlePencilMarks(testBoard);
        if(!validationResult) {
            return { testName: testName, message: "No validation result, when invalid pencil mark expected", result: false, board: _boardString(testBoard) };
        } else if(!_anyPencilMarkValuesMatch(validationResult, value)) {
            return { testName: testName, message: "Validation result did not contain expected value " + value + " result was " + JSON.stringify(validationResult), result: false, board: _boardString(testBoard) };
        } else if (!_anyValueCoordMatch(validationResult, [5,0])) {
            return { testName: testName, message: "Validation result did not contain expected value coordinate " + [5,0] + " result was " + JSON.stringify(validationResult), result: false, board: _boardString(testBoard) };
        } else if (!_anyPencilMarkCoordMatch(validationResult, [0,0])) {
            return { testName: testName, message: "Validation result did not contain expected pencil mark coordinate " + [0,0] + " result was " + JSON.stringify(validationResult), result: false, board: _boardString(testBoard) };
        }
        return { testName: testName, result: true };
    };
    Tests.push(validatePuzzlePencilMarksRowTest);

    var validatePuzzlePencilMarksColumnTest = function() {
        var testName = "Validate Pencil Marks, Column Test";
        var testBoard = new SudokuBoard(fullBoard);
        var value = testBoard.getValue(0,5);
        testBoard.setValue(0,0,0);
        testBoard.addPencilMark(0,0,value);
        var validationResult = Validator.validatePuzzlePencilMarks(testBoard);
        if (!validationResult) {
            return { testName: testName, message: "No validation result, when invalid pencil mark expected", result: false, board: _boardString(testBoard) };
        } else if(!_anyPencilMarkValuesMatch(validationResult, value)) {
            return { testName: testName, message: "Validation result did not contain expected value " + value + " result was " + JSON.stringify(validationResult), result: false, board: _boardString(testBoard) };
        } else if (!_anyValueCoordMatch(validationResult, [0,5])) {
            return { testName: testName, message: "Validation result did not contain expected value coordinate " + [0,5] + " result was " + JSON.stringify(validationResult), result: false, board: _boardString(testBoard) };
        } else if (!_anyPencilMarkCoordMatch(validationResult, [0,0])) {
            return { testName: testName, message: "Validation result did not contain expected pencil mark coordinate " + [0,0] + " result was " + JSON.stringify(validationResult), result: false, board: _boardString(testBoard) };
        }
        return {testName: testName, result: true };
    };
    Tests.push(validatePuzzlePencilMarksColumnTest);

    var validatePuzzlePencilMarksRegionTest = function() {
        var testName = "Validate Pencil Marks, Region Test";
        var testBoard = new SudokuBoard(fullBoard);
        var value = testBoard.getValue(1,1);
        testBoard.setValue(0,0,0);
        testBoard.addPencilMark(0,0,value);
        var validationResult = Validator.validatePuzzlePencilMarks(testBoard);
        if(!validationResult) {
            return { testName: testName, message: "No validation result, when invalid pencil mark expected", result: false, board: _boardString(testBoard) };
        } else if(!_anyPencilMarkValuesMatch(validationResult, value)) {
            return { testName: testName, message: "Validation result did not contain expected value " + value + " result was " + JSON.stringify(validationResult), result: false, board: _boardString(testBoard) };
        } else if (!_anyValueCoordMatch(validationResult, [1,1])) {
            return { testName: testName, message: "Validation result did not contain expected value coordinate " + [1,1] + " result was " + JSON.stringify(validationResult), result: false, board: _boardString(testBoard) };
        } else if (!_anyPencilMarkCoordMatch(validationResult, [0,0])) {
            return { testName: testName, message: "Validation result did not contain expected pencil mark coordinate " + [0,0] + " result was " + JSON.stringify(validationResult), result: false, board: _boardString(testBoard) };
        }
        return { testName: testName, result: true };
    };
    Tests.push(validatePuzzlePencilMarksRegionTest);

    // Test validateAgainstSolution
    // Returns { coord, type } or null
     var validateAgainstSolutionValidTest = function() {
         var testName = "Validate Against Solution";
         if(Validator.validateAgainstSolution(fullBoard, fullBoard) !== null) {
            return { testName: testName, message: "Unexpected validation error", result: false, board: _boardString(fullBoard) };
         }
         return { testName: testName, result: true };
     };
    Tests.push(validateAgainstSolutionValidTest);

    var validateAgainstSolutionInvalidTest = function() {
        var testName = "Validate Against Solution, Invalid Values";
        var secondBoard = new SudokuBoard(fullBoard);
        secondBoard.setValue(0,0,secondBoard.getValue(1,1));
        var validationResult =  Validator.validateAgainstSolution(secondBoard, fullBoard);
        if(validationResult.coord.toString() !== [0,0].toString()) {
            return { testName: testName, message: "Incorrect Validation Coordinate was " + validationResult.coord + " expected " + [0,0], result: false, board: _boardString(secondBoard) };
        }
        return { testName: testName, result: true };
    };
    Tests.push(validateAgainstSolutionInvalidTest);

    // Test validatePencilMarksAgainstSolution
    // Returns { value, coord, type } or null
    var validatePencilMarksAgainstSolutionValidTest = function() {
        var testName = "Validate Pencil Marks Against Solution, Valid Board";
        var secondBoard = new SudokuBoard(fullBoard);
        var value = secondBoard.getValue(0,0);
        secondBoard.setValue(0,0,0);
        secondBoard.addPencilMark(0,0,value);
        if(Validator.validatePencilMarksAgainstSolution(secondBoard, fullBoard) !== null) {
            return { testName: testName, message: "Unexpected validation error", result: false, board: _boardString(secondBoard) };
        }
        return { testName: testName, result: true };
    };
    Tests.push(validatePencilMarksAgainstSolutionValidTest);

    var validatePencilMarksAgainstSolutionInvalidTest = function() {
        var testName = "Validate Pencil Marks Against Solution, 'Invalid Test'";
        var secondBoard = new SudokuBoard(fullBoard);
        var value = secondBoard.getValue(0,0);
        secondBoard.setValue(0,0,0);
        var validationResult = Validator.validatePencilMarksAgainstSolution(secondBoard, fullBoard);
        if(validationResult.value !== value) {
            return { testName: testName, message: "Unexpected value was " + validationResult.value + " expected " + value, result: false, board: _boardString(secondBoard) };
        } else if (validationResult.coord.toString() !== [0,0].toString()) {
            return { testName: testName, message: "Unexpected coordinates was " + validationResult.coord + " expected " + [0,0], result: false, board: _boardString(secondBoard) };
        }
        return { testName: testName, result: true };
    };
    Tests.push(validatePencilMarksAgainstSolutionInvalidTest);

    function RunTests(id) {
        var passedTests = 0;
        var results = "";
        for(var i = 0; i < Tests.length; i++) {
            var testResult = Tests[i]();
            if(testResult.result === true) {
                testResult.message = "<span style='color: green'>passed</span>";
                passedTests++;
            } else {
                testResult.message = "<span style='color: red'>"+ testResult.message + "</span>";
            }
            results += "<p>Test #" + (i+1) +" '"+testResult.testName+"': " + testResult.message + "</p>";
            if(testResult.board) {
                results += "<pre>" + testResult.board + "</pre>";
            }
        }
        $("#"+id).append("<p>" + passedTests + " out of " + Tests.length + " tests passed.</p>" + results);
        /*
         $("#"+id).append("<p>Generated Full Board:</p> <pre>" + _boardString(fullBoard) + "</pre>");
        */
    }

    function _boardString(board) {
        var result = "";
        for(var x = 0; x < 9; x++) {
            for(var y = 0; y < 9; y++) {
                var value = board.getValue(x,y);
                if(value) {
                    result += " " + board.getValue(x,y) + " ";
                } else {
                    result += "p" + Utilities.singlePencilMark(board.getPencilMark(x,y)) + " ";
                }
            }
            result += "\n";
        }
        return result;
    }

    return { RunTests: RunTests };
}();

return {ValidatorTests:ValidatorTests};
}();
return {Tests:Tests,Controller:Controller,FullBoardGenerator:FullBoardGenerator,PuzzleGenerator:PuzzleGenerator,Solver:Solver,Utilities:Utilities,Validator:Validator,View:View};
}();
