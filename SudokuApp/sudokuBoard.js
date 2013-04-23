function SudokuBoard(sudokuBoard) {
    // Pencil Marks
    this.getPencilMark = function(x, y) {
        return pencilMarks[x + 9*y];
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
                pencilMarks[x + 9*y] = sudokuBoard.getPencilMark(x,y).slice(0);
            }
        }
    }
};