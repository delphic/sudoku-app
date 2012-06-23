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
