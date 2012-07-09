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

