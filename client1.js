jQuery(function($) {
    var funcOrOpenParenRx = /^ *(sin|cos|) *\(/;
    var closeParenRx = /^ *\)/;
    var numberRx = new RegExp('^ *' +
        '(?:[+-]?'          + // optional sign, then either
            '(?:(?:\\d*\\.\\d*)|'  + // fractional part, or...
            '(?:\\d+)))'           + // integer part,
        '(?:[eE][+-]?\\d+)? *'); // then finally optional exponent
    var variableRx = /^ *x */;
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
                } else if(matches(variableRx)) {
                    rpn.push('x');
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

    // Plotting stuff
    var plot = {
        STEP: 0.01,
        XMIN: -3.2,
        XMAX: 3.2,
        YMIN: -1.2,
        YMAX: 1.2,
        TICK: 0.2,
        TICK_SIZE: 2,
        TICK_SIZE_LONG: 3,
    };
    // convert to pixel coords
    function xPx(x) {
        return Math.round((x - plot.XMIN - plot.STEP / 2) / plot.STEP);
    }
    function yPx(y) {
        return Math.round((y - plot.YMIN - plot.STEP / 2) / plot.STEP);
    }
    // draw a line in pixel coords
    function line(ctx, sx, sy, ex, ey) {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
    }

    function initCanvas(canvas) {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        // also clears
        canvas.width = Math.round((plot.XMAX - plot.XMIN) / plot.STEP) + 1;
        canvas.height = Math.round((plot.YMAX - plot.YMIN) / plot.STEP) + 1;
        ctx.fillStyle = '#000000';

        var originXpx = xPx(0.0), originYpx = yPx(0.0);
        // axes
        line(ctx, 0, originYpx, canvas.width, originYpx);
        line(ctx, originXpx, 0, originXpx, canvas.height);
        // x,y ticks
        for(var i = 1; ; i++) {
            var c = plot.TICK * i;
            if (c > plot.XMAX && c > plot.YMIN)
                break;

            var w = (i % 5) != 0 ? plot.TICK_SIZE : plot.TICK_SIZE_LONG;

            line(ctx, xPx(c), originYpx - w, xPx(c), originYpx + w);
            line(ctx, xPx(-c), originYpx - w, xPx(-c), originYpx + w);
            line(ctx, originXpx - w, yPx(c), originXpx + w, yPx(c));
            line(ctx, originXpx - w, yPx(-c), originXpx + w, yPx(-c));
        }
    }

    function plotExpr(rpn) {
        var canvas = $('#graph')[0];
        var ctx = canvas.getContext('2d');
        initCanvas(canvas);

        ctx.fillStyle = '#ff0000';
        for (var i = 0; ; i++) {
            var x = plot.XMIN + i * plot.STEP;
            if (x > plot.XMAX)
                break;

            var y = evalExpr(rpn, x);
            // canvas axis is upside down from math axis
            ctx.fillRect(xPx(x), canvas.height - yPx(y), 1, 1);
        }
    }

    function onFormSubmit(e) {
        e.preventDefault();
        var form = this;
        var expr = $(form).children('[name=expr]').val();
        try {
            var rpn = parseExpr(expr, false)[0];

            if (expr.indexOf('x') == -1)
                evalExpr(rpn, undefined, true);
            else
                plotExpr(rpn);
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
