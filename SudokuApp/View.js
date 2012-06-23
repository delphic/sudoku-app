// SudokuView
// Will carry out the changes to the view presentation of the board
// request by the controller, for now it will probably just redraw
// the board each time, but we will have separate functions for each
// request in order to facilitate optimisation at a later date
var View = function(){
    var ZenHtml = function() {
        function getBoardHtml(sudokuBoard) {
            var tableHtml = "<table>";
            for(var y = 0; y < 9; y++) {
                tableHtml += "<tr class='r"+y+"'>";
                for(var x = 0; x < 9; x++) {
                    var value = sudokuBoard.getValue(x,y);
                    var disabled = sudokuBoard.isDisabled(x,y);
                    tableHtml += "<td class=\"c" + x + " " + ((disabled) ? "disabled" : "")  + "\" " + ((disabled) ? "" : _onClickJs(x,y)) + " >";
                    if(value) {
                        tableHtml += value;
                    } else {
                        tableHtml += _getPencilMarkHtml(sudokuBoard.getPencilMark(x,y));
                    }
                    tableHtml += "</td>";
                }
                tableHtml += "</tr>";
            }
            tableHtml += "</table>";
            return tableHtml;
        }

        function _onClickJs(x,y) {
            return "onclick=\"Sudoku.Controller.selectCell(" + x + "," + y + ");\"";
        }

        function _getPencilMarkHtml(pencilMark) {
            var html = "";
            if(!pencilMark[0]) {
                html += "<table>";
                for(var y=0; y < 3; y++) {
                    html += "<tr>";
                    for(var x=0; x < 3; x++) {
                        var number = 1 + x + y*3;
                        html += "<td>";
                        html += (pencilMark[number]) ? number : "";
                        html += "</td>";
                    }
                    html += "</tr>";
                }
                html += "</table>";
            }
            return html;
        }

        return {
            getBoardHtml: getBoardHtml
        }
    }();

    function bindButton(id, command) {
        $("#"+id).click(command);
    }

    function clearSelection() {
        $(".selected").removeClass("selected");
    }

    function drawPuzzle(puzzle) {
        $('.container').html(ZenHtml.getBoardHtml(puzzle));
    }

    function setButtonText(id, text) {
        $("#"+id).html(text);
    }

    function selectCell(x, y) {
        $(".selected").removeClass("selected");
        $(".r"+y+" .c"+x).addClass("selected");
    }

    function updateCell(x, y, puzzle) {
        drawPuzzle(puzzle);
    }

    return {
        bindButton: bindButton,
        clearSelection: clearSelection,
        drawPuzzle: drawPuzzle,
        selectCell: selectCell,
        setButtonText: setButtonText,
        updateCell: updateCell
    }
}();
