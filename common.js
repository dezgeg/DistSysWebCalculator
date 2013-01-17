var history;

function addToHistoryView(calculation) {
    var list = $('#calculationResults');
    var entry = $('<div>');
    entry.text("" + calculation.arg1 + " " + calculation.op +
        " " + calculation.arg2 + " = " + calculation.result);
    list.append(entry);
}

function initHistory() {
    history = JSON.parse(window.localStorage.calcHistory || '[]');
    $.each(history, function(i, calc) { addToHistoryView(calc); });
}

function calculateOnServer(params) {
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

function calculateWithHistory(params) {
    var calc = calculateOnServer(params);
    history.push(calc);
    addToHistoryView(calc);
    window.localStorage.calcHistory = JSON.stringify(history);
    return calc;
}

