// window.calculate - Calculation functions: all have signature like
//      calc(arg1, op, arg2) for binary operations (e.g calc(6, '*', 7) -> 42)
//      calc(arg, op) for unary operations sin/cos (e.g calc(pi, 'sin') -> 0)
//
// onServer: perform AJAX call for elementary (+,-,*,/) operations,
//           approximate sin/cos with elementary AJAX operations using taylor series
// onServerButTrigLocally: like onServer, but calculate sin/cos directly on client side
// onServerWithHistory: like onServer, but also add the operations to the history,
//                      see js/history.js

var approximateSin = function(x, calcFn) {
    // Use Taylor approximation x - x^3/3! + x^5/5! - x^7/7!
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
    onServerButTrigLocally: function(a, op, b) {
        if (parser.isUnaryTrigOp(op))
            return Math[op](a);
        return calculate.onServer(a, op, b);
    },
    onServerWithHistory: function(a, op, b) {
        var result = calculate.onServer(a, op, b);
        if (parser.isUnaryTrigOp(op))
            history.addCalculation(op + '(' + a + ') = ' + result);
        else
            history.addCalculation(a + ' ' + op + ' ' + b + ' = ' + result);
    }
};
