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