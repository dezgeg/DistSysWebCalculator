jQuery(function($) {
    var closeParenRx = /^( *\))/;
    var numberOrParenRx = new RegExp('^( *(?:' +
        '\\(|(?:[+-]?'          + // optional sign, then either
            '(?:(?:\\d*\\.\\d*)|'  + // fractional part, or...
            '(?:\\d+)))'           + // integer part,
        '(?:[eE][+-]?\\d+)? *))'); // then finally optional exponent
    var operatorRx = /^([-+*\/])/;

    function parseExpr(str, isRecursive) {
        str = str.trim();

        // convert expression to RPN
        var rpn = [];
        var previousOp = null; // previous operator, to be pushed to rpn
                               // after the next number
        var expectNumber = true; // parser state machine; expression 
                                 // is alternate numbers & operators
        while(str.length > 0) {
            var rx = expectNumber ? numberOrParenRx : operatorRx;

            // Is the next token invalid?
            if(!rx.test(str)) {
                // If called recursively, ')' is valid and ends the expression
                if (isRecursive && closeParenRx.test(str))
                    return [rpn, str.substring(RegExp.$1.length)];

                // Otherwise, error.
                return null;
            }
            str = str.substring(RegExp.$1.length);

            if(!expectNumber) {
                previousOp = RegExp.$1;
            } else {
                if(RegExp.$1.indexOf('(') == -1) {
                    rpn.push(Number(RegExp.$1));
                } else {
                    // If '(', recursively parse until next ')'...
                    var parenResult = parseExpr(str, true);
                    if(!parenResult)
                        return null;

                    // Merge the rpn expressions and continue normally
                    rpn = rpn.concat(parenResult[0]);
                    str = parenResult[1];
                }

                // Infix -> RPN conversion:
                if(previousOp)
                    rpn.push(previousOp);
            }
            expectNumber = !expectNumber;
        }
        if(expectNumber)
            return null; // ended in an operator
        return [rpn, str];
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
        if(!evalExpr(expr)) {
            alert("Not a valid expression!");
        }
        return false;
    }

    function init() {
        initHistory();
        $('#mainForm').on('submit', onFormSubmit);
    }
    init();
});
