var SolverTests = function() {

    var Tests = [];

    // Add to Tests

    function RunTests(id) {
        for(var i = 0; i < Tests.length; i++) {
            var testResult = Tests[i]();
            if(testResult === true) { testResult = "passed"; }
            $("#"+id).append("<p>Test #" + i + ": " + testResult + "</p>");
        }
    }

    return { RunTests: RunTests }
}();