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