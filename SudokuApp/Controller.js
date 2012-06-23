// SudokuController
var Controller = function() {
    var solution;
    var puzzle;
    var highlight = false;
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
            if(!selectCellFirst) { View.clearSelection(); }
        });
        View.bindButton("btnHighlight", function() {
            highlight = !highlight;
            View.setButtonText("btnHighlight", (highlight) ? "Disable Highlight" : "Enable Highlight");
            // TODO: Enable highlight
        });

        View.bindButton("btnPencil", function() {
            pencilDown = !pencilDown;
            View.setButtonText("btnPencil", (pencilDown) ? "Disable Pencil" : "Enable Pencil");
        });
        View.bindButton("btnEraser", function() {
            eraserDown = !eraserDown;
            View.setButtonText("btnEraser", (eraserDown) ? "Disable Eraser" : "Enable Eraser" );
        });
    }

    function selectCell(x,y) {
        selectedCell = [x, y];
        if(eraserDown) {
            setCellValue(0);
            selectedCell = null;
        } else {
            if(selectCellFirst) {
                if(!eraserDown) {
                    View.selectCell(x,y);
                }
            }
            // TODO: If cell then value && highlight, enable highlight on value of this cell
            if(!selectCellFirst && selectedValue) {
                if(!pencilDown) {
                    setCellValue(selectedValue);
                }
            }
        }
    }

    function selectNumber(value) {
        selectedValue = value;
        if(selectCellFirst && selectedCell) {
            setCellValue(value);
        }
    }

    function setCellValue(value) {
        // TODO: Check for conflicts, and do not set value and highlight them if found
        puzzle.setValue(selectedCell[0], selectedCell[1], value);
        View.updateCell(selectedCell[0], selectedCell[1], puzzle);
        // Value = 0 if erasing, do not select cell
        if(selectCellFirst && value) {
            View.selectCell(selectedCell[0], selectedCell[1]);
        }
    }

    function init() {
        solution = FullBoardGenerator.generateBoard();
        // TODO : Replace with Proper Sudoku Puzzle Generator !

        puzzle = PuzzleGenerator.Generate({ fullBoard: solution });

        /*
         puzzle = new SudokuBoard(solution);
         for(var n = 0; n < 20; n++) {
         var x = Math.floor(Math.random()*5);
         var y = Math.floor(Math.random()*9);
         puzzle.setValue(x,y,0);
         puzzle.setValue(8-x,8-y, 0);
         }
         puzzle.lock();
         */
    }

    return {
        selectCell: 	selectCell
    }
}();

