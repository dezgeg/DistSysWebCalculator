var funcOrOpenParenRx = /^(sin|cos|) *\(/;
var closeParenRx = /^\)/;
var numberRx = new RegExp('^' +
    '[+-]?(?:'                + // optional sign, then either
        '(?:\\d*\\.\\d*)|'    + // fractional part, or...
        '\\d+)'               + // integer part,
    '(?:[eE][+-]?\\d+)?');      // then finally optional exponent
var variableRx = /^x/;
var operatorRx = /^[-+*\/]/;
var whiteSpaceRx = /^[ \t]+/;


var parseExprRecursive = function(str, isRecursive) {
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

        if(matches(whiteSpaceRx))
            continue;

        if(expectOperator) {
            if (isRecursive && matches(closeParenRx))
                return [rpn, str];
            if(!matches(operatorRx))
                throw new Error("Unexpected junk near '" + str + "'");
            previousOp = RegExp.lastMatch;
        } else {
            if(matches(numberRx)) {
                rpn.push(Number(RegExp.lastMatch));
            } else if(matches(variableRx)) {
                rpn.push('x');
            } else if(matches(funcOrOpenParenRx)) {
                // If '(' or 'func(', recursively parse until next ')'...
                var func = RegExp.$1;
                var parenResult = parseExprRecursive(str, true);

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

    if(isRecursive)
        throw new Error("Too few )'s");

    if(!expectOperator)
        throw new Error("Expression ends in an operator");
    return [rpn, str];
};

parser = {
    parse: function(expr) {
        return parseExprRecursive(expr, false)[0];
    },
    isUnaryTrigOp: function(op) {
        return op == 'sin' || op == 'cos';
    }
};
