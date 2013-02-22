// // Tuomas Tynkkynen, 013770385
// This file provides window.parser, which has the following functions
// related to parsing and evaluating an infix math expression:
//  - parse(exprString)
//  - isUnaryTrigOp(operator)
//  - evalExpr(rpn, calcFn, x)

// Regexen used by parseExprRecursive:
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

// Parse a mathematical expression and convert it to RPN.
// Supported are:
//  - floating point literals
//  - the single variable 'x' (used when plotting)
//  - operators +, -, *, /
//  - arbitrary nesting and grouping with (parentheses)
//  - sin and cos functions
//
// Neither unary + and - are supported.
// All operators have equal precedence and associate to left
//
// param str:         the (sub-)expression to be parsed
// param isRecursive: whether the parse is to be done to
//                    a nested parenthesis expression;
//                    changes how the ')' is interpreted.
//
// return: on succesful parse, pair of [rpn, rest]
//  rpn:  the RPN equivalent to the expression
//  rest: rest of the remaining input string.
//        i.e the characters after a ')' if isRecursive was true,
//        otherwise empty
//  On errors, exceptions are thrown.
var parseExprRecursive = function(str, isRecursive) {
    // Test if the current input matches rx,
    // and advance the input if it did (by modifying
    // the variable in parseExprRecursive's closure)
    function matches(rx) {
        if(rx.test(str)) {
            str = str.substring(RegExp.lastMatch.length);
            return true;
        }
        return false;
    }

    var rpn = [];
    var previousOp = null; // previous operator, to be pushed to rpn
                           // after the next number
    var expectOperator = false; // parser state machine; expression 
                                // is alternate numbers & operators
    while(str.length > 0) {

        // Whitespace -> always ignore
        if(matches(whiteSpaceRx))
            continue;

        if(expectOperator) {
            // expecting an operator or EOF
            if (isRecursive && matches(closeParenRx))
                return [rpn, str];
            if(!matches(operatorRx))
                throw new Error("Unexpected junk near '" + str + "'");
            previousOp = RegExp.lastMatch;
        } else {
            // expecting a number, variable or a sub-expression
            if(matches(numberRx)) {
                rpn.push(Number(RegExp.lastMatch));
            } else if(matches(variableRx)) {
                rpn.push('x');
            } else if(matches(funcOrOpenParenRx)) {
                // If '(' or 'func(', recursively parse until next ')'...
                var func = RegExp.$1;
                var parenResult = parseExprRecursive(str, true);

                // Merge the rpn expressions and continue
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
    // Parse a mathematical expression and convert it to RPN.
    // See parseExprRecursive for details.
    //
    // param expr: the expression to be parsed
    // returns: the RPN, or throws on any parse errors
    parse: function(expr) {
        expr = expr.trim();
        if (expr.length === 0)
            throw new Error('Empty expression');

        return parseExprRecursive(expr, false)[0];
    },
    // Utility function, is the operator an unary trigonometric operator.
    isUnaryTrigOp: function(op) {
        return op == 'sin' || op == 'cos';
    },
    // Calculate the value of a rpn expression
    //
    // param rpn:    the rpn expression to be calculated
    // param calcFn: function used to do the actual calculations
    //               see js/calculate.js for some functions
    // param x:      value of the variable x, which is used
    //               when plotting graphs.
    // return: value of the expression, as a float
    evalExpr: function(rpn, calcFn, x) {
        var stack = [];
        for(var i = 0; i < rpn.length; i++) {
            if(typeof(rpn[i]) === 'number') {
                stack.push(rpn[i]);
            } else if (rpn[i] == 'x') {
                stack.push(x);
            } else if (rpn[i] == 'sin' || rpn[i] == 'cos') {
                stack.push(calcFn(stack.pop(), rpn[i]));
            } else {
                var arg2 = stack.pop();
                var arg1 = stack.pop();
                var result = calcFn(arg1, rpn[i], arg2);
                stack.push(result);
            }
        }
        return stack[0];
    },
};
