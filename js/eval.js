var calcSin = function(x) {
    // Use Taylor approximation x - x^3/3! + x^5/5! - x^7/7!
    var x_2 = calc(x, '*', x);
    var x_3 = calc(x, '*', x_2);
    var x_5 = calc(x_3, '*', x_2);
    var x_7 = calc(x_5, '*', x_2);

    var f3 = 1 * 2 * 3,
        f5 = f3 * 4 * 5,
        f7 = f5 * 6 * 7;

    var acc = x;
    acc = calc(acc, '-', calc(x_3, '/', f3));
    acc = calc(acc, '+', calc(x_5, '/', f5));
    acc = calc(acc, '-', calc(x_7, '/', f7));

    return acc;
}

function evalExpr(rpn, x, withHistory) {
    var stack = [];
    for(var i = 0; i < rpn.length; i++) {
        if(typeof(rpn[i]) === 'number') {
            stack.push(rpn[i]);
        } else if (rpn[i] == 'x') {
            stack.push(x);
        } else if (rpn[i] == 'sin') {
            stack.push(calcSin(stack.pop()));
        } else {
            var arg2 = stack.pop();
            var arg1 = stack.pop();
            var result = calc(arg1, rpn[i], arg2, withHistory);
            stack.push(result);
        }
    }
    return stack[0];
}
