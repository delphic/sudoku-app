// Should probably be using a proper framework e.g. QUnit
var ValidatorTests = function(){
    var Tests = [];

    var fullBoard = FullBoardGenerator.generateBoard();

    // Test validatePuzzleEntries
    // Separate tests for row, column and region
    // Returns { value, coords, type } if there's a clash, null otherwise
    var validatePuzzleEntriesFullBoardTest = function() {
        if (Validator.validatePuzzleEntries(fullBoard) === null) {
            return true;
        } else {
            return "Unexpected result expected null";
        }
    };
    Tests.push(validatePuzzleEntriesFullBoardTest);

    var validatePuzzleEntriesRowClashTest = function() {
        var boardClash = new SudokuBoard(fullBoard);
        var value = boardClash.getValue(5,0)
        boardClash.setValue(0, 0, value);
        var validationResult = Validator.validatePuzzleEntries(boardClash);
        if(validationResult === null) {
            return "Validation Result was null, expected clash at [0,0], [5,0]";
        } else if (validationResult.value !== value) {
            return "Validation Result was " + validationResult.value + " expected " + value;
        } else if (validationResult.coords !== [[0,0],[5,0]] && validationResult.coords !== [[5,0],[0,0]]) {
            return "Unexpected validation coords  was " + validationResult.coords + " expected " + [[0,0],[5,0]];
        }
        return true;
    };
    Tests.push(validatePuzzleEntriesRowClashTest);

    var validatePuzzleEntriesColumnClashTest = function() {
        var boardClash = new SudokuBoard(fullBoard);
        var value = boardClash.getValue(0,6)
        boardClash.setValue(0, 0, value);
        var validationResult = Validator.validatePuzzleEntries(boardClash);
        if(validationResult === null) {
            return "Validation Result was null, expected clash at [0,0], [0,6]";
        } else if (validationResult.value !== value) {
            return "Validation Result was " + validationResult.value + " expected " + value;
        } else if (validationResult.coords !== [[0,0],[0,6]] && validationResult.coords !== [[0,6],[0,0]]) {
            return "Unexpected validation coords  was " + validationResult.coords + " expected " + [[0,0],[0,6]];
        }
        return true;
    };
    Tests.push(validatePuzzleEntriesColumnClashTest);

    var validatePuzzleEntriesRegionClashTest = function() {
        var boardClash = new SudokuBoard(fullBoard);
        var value = boardClash.getValue(1,1)
        boardClash.setValue(0, 0, value);
        var validationResult = Validator.validatePuzzleEntries(boardClash);
        if(validationResult === null) {
            return "Validation Result was null, expected clash at [0,0], [1,1]";
        } else if (validationResult.value !== value) {
            return "Validation Result was " + validationResult.value + " expected " + value;
        } else if (validationResult.coords !== [[0,0],[1,1]] && validationResult.coords !== [[1,1],[0,0]]) {
            return "Unexpected validation coords  was " + validationResult.coords + " expected " + [[0,0],[1,1]];
        }
        return true;
    };
    Tests.push(validatePuzzleEntriesRegionClashTest);

    // Test validatePuzzlePencilMarks
    // Returns { value, valueCoord, pencilMarkCoord, type } or null
    var validatePuzzlePencilMarksValidTest = function() {
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
            return true;
        } else {
            return "Unexpected result expected null";
        }
    };
    Tests.push(validatePuzzlePencilMarksValidTest);

    var validatePuzzlePencilMarksRowTest = function() {
        var testBoard = new SudokuBoard(fullBoard);
        var value = testBoard.getValue(5,0);
        testBoard.setValue(0,0,0);
        testBoard.addPencilMark(0,0,value);
        var validationResult = Validator.validatePuzzlePencilMarks(fullBoard);
        if(validationResult.value !== value) {
            return "Unexpected value was " + validationResult.value + " expected " + value;
        } else if (validationResult.valueCoord !== [5,0]) {
            return "Unexpected value coordinate was " + validationResult.valueCoord + " expected " + [5,0];
        } else if (validationResult.pencilMarkCoord !== [0,0]) {
            return "Unexpected pencil mark coordinate was " +  validationResult.pencilMarkCoord + " expected " + [0,0];
        }
        return true;
    };
    Tests.push(validatePuzzlePencilMarksRowTest);

    var validatePuzzlePencilMarksColumnTest = function() {
        var testBoard = new SudokuBoard(fullBoard);
        var value = testBoard.getValue(0,5);
        testBoard.setValue(0,0,0);
        testBoard.addPencilMark(0,0,value);
        var validationResult = Validator.validatePuzzlePencilMarks(fullBoard);
        if(validationResult.value !== value) {
            return "Unexpected value was " + validationResult.value + " expected " + value;
        } else if (validationResult.valueCoord !== [0,5]) {
            return "Unexpected value coordinate was " + validationResult.valueCoord + " expected " + [0,5];
        } else if (validationResult.pencilMarkCoord !== [0,0]) {
            return "Unexpected pencil mark coordinate was " +  validationResult.pencilMarkCoord + " expected " + [0,0];
        }
        return true;
    };
    Tests.push(validatePuzzlePencilMarksColumnTest);

    var validatePuzzlePencilMarksRegionTest = function() {
        var testBoard = new SudokuBoard(fullBoard);
        var value = testBoard.getValue(1,1);
        testBoard.setValue(0,0,0);
        testBoard.addPencilMark(0,0,value);
        var validationResult = Validator.validatePuzzlePencilMarks(fullBoard);
        if(validationResult.value !== value) {
            return "Unexpected value was " + validationResult.value + " expected " + value;
        } else if (validationResult.valueCoord !== [1,1]) {
            return "Unexpected value coordinate was " + validationResult.valueCoord + " expected " + [1,1];
        } else if (validationResult.pencilMarkCoord !== [0,0]) {
            return "Unexpected pencil mark coordinate was " +  validationResult.pencilMarkCoord + " expected " + [0,0];
        }
        return true;
    };
    Tests.push(validatePuzzlePencilMarksRegionTest);

    // Test validateAgainstSolution
    // Returns { coord, type } or null
     var validateAgainstSolutionValidTest = function() {
         if(Validator.validateAgainstSolution(fullBoard, fullBoard) !== null) {
            return "Unexpected validation error";
         }
         return true;
     };
    Tests.push(validateAgainstSolutionValidTest);

    var validateAgainstSolutionInvalidTest = function() {
        var secondBoard = new SudokuBoard(fullBoard);
        secondBoard.setValue(0,0,secondBoard.getValue(1,1));
        var validationResult =  Validator.validateAgainstSolution(secondBoard, fullBoard);
        if(validationResult.coord !== [0,0]) {
            return "Incorrect Validation Coordinate was " + validationResult.coord + " expected " + [0,0];
        }
    };
    Tests.push(validateAgainstSolutionValidTest);

    // Test validatePencilMarksAgainstSolution
    // Returns { value, coord, type } or null
    var validatePencilMarksAgainstSolutionValidTest = function() {
        var secondBoard = new SudokuBoard(fullBoard);
        var value = secondBoard.getValue(0,0);
        secondBoard.setValue(0,0,0);
        secondBoard.addPencilMark(0,0,value);
        if(Validator.validatePencilMarksAgainstSolution(secondBoard, fullBoard) !== null) {
            return "Unexpected validation error";
        }
        return true;
    };
    Tests.push(validatePencilMarksAgainstSolutionValidTest);

    var validatePencilMarksAgainstSolutionInvalidTest = function() {
        var secondBoard = new SudokuBoard(fullBoard);
        var value = secondBoard.getValue(0,0);
        secondBoard.setValue(0,0,0);
        var validationResult = Validator.validatePencilMarksAgainstSolution(secondBoard, fullBoard);
        if(validationResult.value !== value) {
            return "Unexpected value was " + validationResult.value + " expected " + value;
        } else if (validationResult.coord !== [0,0]) {
            return "Unexpected coordinates was " + validationResult.coord + " expected " + [0,0];
        }
        return true;
    };
    Tests.push(validatePencilMarksAgainstSolutionInvalidTest);

    function RunTests() {
        for(var i = 0; i < Tests.length; i++) {
            var testResult = Tests[0]();
            if(testResult === true) { testResult = "passed"; }
            $("body").append("<p>Test #" + i + ": " + testResult + "</p>");
        }
    }

    return { RunTests: RunTests };
}();