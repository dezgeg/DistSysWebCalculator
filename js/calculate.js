// // Tuomas Tynkkynen, 013770385
// window.calculate - Calculation functions: all have signature like
//      calc(arg1, op, arg2) for binary operations (e.g calc(6, '*', 7) -> 42)
//      calc(arg, op) for unary operations sin/cos (e.g calc(pi, 'sin') -> 0)
//
// onServer: perform AJAX call for elementary (+,-,*,/) operations,
//           approximate sin/cos with elementary AJAX operations using taylor series
// onServerWithHistory: like onServer, but also add the operations to the calculationHistory,
//                      see js/calculationHistory.js
// locally: calculate everything locally

// Calculate the sine of x with the Taylor series approximation
// sin(x) = x - x^3/3! + x^5/5! - x^7/7!
// The approximation is calculated with the calculation function calcFn.
var approximateSin = function(x, calcFn) {
    // Reduce the angle with the identity sin(x + pi) = -sin(x)
    // to improve the Taylor approximation's accuracy
    var negate = false;
    while (isFinite(x) && x > Math.PI) {
        x = calcFn(x, '-', Math.PI);
        negate = !negate;
    }
    while (isFinite(x) && x < -Math.PI) {
        x = calcFn(x, '+', Math.PI);
        negate = !negate;
    }

    var x_2 = calcFn(x, '*', x);
    var x_3 = calcFn(x, '*', x_2);
    var x_5 = calcFn(x_3, '*', x_2);
    var x_7 = calcFn(x_5, '*', x_2);

    var f3 = 1 * 2 * 3,
        f5 = f3 * 4 * 5,
        f7 = f5 * 6 * 7;

    var acc = x;
    acc = calcFn(acc, '-', calcFn(x_3, '/', f3));
    acc = calcFn(acc, '+', calcFn(x_5, '/', f5));
    acc = calcFn(acc, '-', calcFn(x_7, '/', f7));

    if (negate)
        acc = calcFn(0, '-', acc);

    return acc;
}

// doServerAjaxCall: do an synchronous AJAX call to server-side (server.php)
// params: GET params to the PHP script
//
// return value: if the response is a valid IEEE float, it is returned
//               otherwise an exception is thrown
var doServerAjaxCall = function(params) {
    var result = $.ajax('server.php', { async: false, data: params });
    var text = result.responseText;
    var resultDouble = parseFloat(result.responseText);

   if (isNaN(resultDouble) && !/^nan$/i.test(result.responseText))
        throw new Error('Server error: ' + result.status +
            ': ' + result.statusText + ', ' + result.responseText);

    return resultDouble;
}

calculate = {
    // onServer: perform AJAX call for elementary (+,-,*,/) operations,
    //           approximate sin/cos with elementary AJAX operations using taylor series
    onServer: function(a, op, b) {
        if (op == 'sin') {
            return approximateSin(a, calculate.onServer);
        } else if (op == 'cos') {
            return approximateSin( // cos(x) == sin(pi/2 - x)
                    calculate.onServer(Math.PI / 2, '-', a),
                    calculate.onServer);
        }

        var params = {
            arg1: a,
            arg2: b,
            op: op,
        };
        return doServerAjaxCall(params);
    },
    // locally: calculate everything locally
    locally: function(a, op, b) {
        if (parser.isUnaryTrigOp(op))
            return Math[op](a);
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return a / b;
        }
        throw new Error('Invalid op');
    },
    // onServerWithHistory: like onServer, but also add the operations to the calculationHistory,
    //                      see js/calculationHistory.js
    onServerWithHistory: function(a, op, b) {
        var result = calculate.onServer(a, op, b);
        if (parser.isUnaryTrigOp(op))
            calculationHistory.addCalculation(op + '(' + a + ') = ' + result);
        else
            calculationHistory.addCalculation(a + ' ' + op + ' ' + b + ' = ' + result);
        return result;
    }
};
