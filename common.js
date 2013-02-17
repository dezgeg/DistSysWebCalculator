function calculateOnServer(params) {
    var result = $.ajax('server.php', { async: false, data: params });
    var text = result.responseText;
    var resultDouble = parseFloat(result.responseText);

   if (isNaN(resultDouble) && !/^nan$/i.test(result.responseText))
        throw new Error('Server error: ' + result.status +
            ': ' + result.statusText + ', ' + result.responseText);

    var calculation = {};
    for(k in params)
        calculation[k] = params[k];
    calculation.result = resultDouble;
    return calculation;
}

function calc(a, op, b, withHistory) {
    var params = {
        arg1: a,
        arg2: b,
        op: op,
    };
    var calculation = calculateOnServer(params);
    calculation.result += ''; // HACK - no infinities or nans in json. THANK YOU
    if (withHistory) {
        history.addCalculation(calculation);
    }
    return calculation.result;
}

