jQuery(function($) {
    var history;

    function addToHistoryView(calculation) {
        var list = $('#calculationResults');
        var entry = $('<div>');
        entry.text("" + calculation.arg1 + " " + calculation.op +
            " " + calculation.arg2 + " = " + calculation.result);
        list.append(entry);
    }

    function calculate(params) {
        var result = $.ajax('server.php', { async: false, data: params });
        if(result.status != 200)
            throw new Error('Network error: ' + result.status +
                ' - ' + result.statusText);
        var resultJSON = JSON.parse(result.responseText);

        var calculation = {};
        for(k in params)
            calculation[k] = params[k];
        calculation.result = resultJSON.result;
        return calculation;
    }

    function onFormSubmit(e) {
        e.preventDefault();
        var form = this;
        var params = {
            arg1: parseFloat($(form).children('[name=arg1]').val()),
            arg2: parseFloat($(form).children('[name=arg2]').val()),
            op: $(form).children('[name=op]').val(),
        }
        if(isNaN(params.arg1) || isNaN(params.arg2)) {
            alert('Enter valid numbers!');
            return false;
        }

        var calc = calculate(params);
        history.push(calc);
        addToHistoryView(calc);
        window.localStorage.calcHistory = JSON.stringify(history);
    }

    function init() {
        history = JSON.parse(window.localStorage.calcHistory || '[]');
        $.each(history, function(i, calc) { addToHistoryView(calc); });
        $('#mainForm').on('submit', onFormSubmit);
    }
    init();
});
