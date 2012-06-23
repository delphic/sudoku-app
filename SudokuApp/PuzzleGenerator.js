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
