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

    // Do certain marks only exist in one row or column for a given region, if so remove marks from other regions for
    // that row or column
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

    // Do certain marks only exist in one region for a given row or column, if so remove marks from other rows or
    // columns in that region.
    function _multipleLines() {
        // Returns { coords: [array of coordinates], value: value } or null
        // For each number
        for(var n = 1; n < 9; n++) {
            var coordinates = [];
            for(var rowRegion = 0; rowRegion < 3; rowRegion++) {
                for(var localRow = 0; localRow < 3; localRow++) {
                    var pencilMarkInRowCount = 0;
                    var lastColumnRegionWithPencilMark;
                    for(var columnRegion = 0; columnRegion < 3; columnRegion++) {
                        if(Utilities.rowInRegionsHasPencilMark(
                            puzzle,  
                            rowRegion,
                            columnRegion,
                            localRow,
                            n)) {
                            pencilMarkInRowCount++;
                            lastColumnRegionWithPencilMark = columnRegion;
                        }
                    }
                    if(pencilMarkInRowCount == 1){
                        for(var otherRow = 0; otherRow < 3; otherRow++) {
                            if(otherRow!=localRow) {
                                // Any other pencilmarks in region
                                Utilities.getCoordinatesOfPencilMarksInRowInRegion(
                                    puzzle,
                                    rowRegion,
                                    columnRegion,
                                    otherRow,
                                    n,
                                    coordinates); // coordinates is an out;
                            }
                        }
                        if(coordinates.length) {
                            return { coords: coordinates, value: n };   
                        }
                    }
                }
            }

            // Repeat for Columns
            for(var columnRegion = 0; columnRegion < 3; columnRegion++) {
                for(var localRow = 0; localRow < 3; localRow++) {
                    var pencilMarkInCoulmnCount = 0;
                    var lastRowRegionWithPencilMark;
                    for(var rowRegion = 0; rowRegion < 3; rowRegion++) {
                        if(Utilities.coulmnInRegionsHasPencilMark(
                            puzzle,  
                            rowRegion,
                            columnRegion,
                            localRow,
                            n)) {
                            pencilMarkInCoulmnCount++;
                            lastRowRegionWithPencilMark = rowRegion;
                        }
                    }
                    if(pencilMarkInCoulmnCount == 1){
                        for(var otherRow = 0; otherRow < 3; otherRow++) {
                            if(otherRow!=localRow) {
                                // Any other pencilmarks in region
                                Utilities.getCoordinatesOfPencilMarksInColumnInRegion(
                                    puzzle,
                                    rowRegion,
                                    columnRegion,
                                    otherRow,
                                    n,
                                    coordinates); // coordinates is an out;
                            }
                        }
                        if(coordinates.length) {
                            return { coords: coordinates, value: n };   
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
