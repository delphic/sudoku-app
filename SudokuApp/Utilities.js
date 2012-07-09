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

    function pencilMarkContains(pencilMark, value) {
        return (!pencilMark[0] && pencilMark[value]);
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
        rowHasValue: rowHasValue,
        regionHasValue: regionHasValue,
        getRegionIndex: getRegionIndex,
        singlePencilMark: singlePencilMark,
        pencilMarkContains: pencilMarkContains
    }
}();
