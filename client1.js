jQuery(function($) {
    var funcOrOpenParenRx = /^ *(sin|cos|) *\(/;
    var closeParenRx = /^ *\)/;
    var numberRx = new RegExp('^ *' +
        '(?:[+-]?'          + // optional sign, then either
            '(?:(?:\\d*\\.\\d*)|'  + // fractional part, or...
            '(?:\\d+)))'           + // integer part,
        '(?:[eE][+-]?\\d+)? *'); // then finally optional exponent
    var operatorRx = /^[-+*\/]/;

    function parseExpr(str, isRecursive) {
        str = str.trim();

        function matches(rx) {
            if(rx.test(str)) {
                str = str.substring(RegExp.lastMatch.length);
                return true;
            }
            return false;
        }

        // convert expression to RPN
        var rpn = [];
        var previousOp = null; // previous operator, to be pushed to rpn
                               // after the next number
        var expectOperator = false; // parser state machine; expression 
                                    // is alternate numbers & operators
        while(str.length > 0) {

            if(expectOperator) {
                if (isRecursive && matches(closeParenRx))
                    return [rpn, str];
                if(!matches(operatorRx))
                    throw new Error("Unexpected junk near '" + str + "'");
                previousOp = RegExp.lastMatch;
            } else {
                if(matches(numberRx)) {
                    rpn.push(Number(RegExp.lastMatch));
                } else if(matches(funcOrOpenParenRx)) {
                    // If '(' or 'func(', recursively parse until next ')'...
                    var func = RegExp.$1;
                    var parenResult = parseExpr(str, true);

                    // Merge the rpn expressions and continue normally
                    rpn = rpn.concat(parenResult[0]);
                    str = parenResult[1];
                    if(func.length > 1)
                        rpn.push(func);
                } else {
                    throw new Error("Unexpected junk near '" + str + "'");
                }

                // Infix -> RPN conversion:
                if(previousOp)
                    rpn.push(previousOp);
            }
            expectOperator = !expectOperator;
        }
        if(!expectOperator)
            throw new Error("Expression ends in an operator");
        return [rpn, str];
    }

    function calc(a, op, b) {
        return calculateWithHistory({
            arg1: a,
            arg2: b,
            op: op,
        }).result;
    }

    function calcSin(x) {
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

    function evalExpr(e) {
        var temp = parseExpr(e, false);
        if(!temp)
            return null;
        var rpn = temp[0];

        var stack = [];
        for(var i = 0; i < rpn.length; i++) {
            if(typeof(rpn[i]) === 'number') {
                stack.push(rpn[i]);
            } else if (rpn[i] == 'sin') {
                stack.push(calcSin(stack.pop()));
            } else {
                var arg2 = stack.pop();
                var arg1 = stack.pop();
                var result = calculateWithHistory({
                    arg1: arg1,
                    arg2: arg2,
                    op: rpn[i],
                }).result;
                stack.push(result);
            }
        }
        return stack[0];
    }

    function onFormSubmit(e) {
        e.preventDefault();
        var form = this;
        var expr = $(form).children('[name=expr]').val();
        try {
            evalExpr(expr);
        } catch(e) {
            alert(e);
        }
        return false;
    }

    function init() {
        initHistory();
        $('#mainForm').on('submit', onFormSubmit);
    }
    init();
});
