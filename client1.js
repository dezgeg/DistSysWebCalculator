jQuery(function($) {
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
        STEP: 0.05,
        XMIN: -3.2,
        XMAX: 3.2,
        YMIN: -1.2,
        YMAX: 1.2,
        TICK: 0.5,
        TICK_SIZE: 2,
        TICK_SIZE_LONG: 3,
    };
    // convert to pixel coords
    function xPx(x) {
        return Math.round((x - plot.XMIN) / plot.STEP);
    }
    function yPx(y) {
        return Math.round((y - plot.YMIN) / plot.STEP);
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
        ctx.lineWidth = 1.0;
        // fixes ugly anti-aliasing problems
        ctx.translate(0.5, 0.5);

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
        var pixelFunc = function(i) {
            var x = plot.XMIN + i * plot.STEP;
            if (x > plot.XMAX)
                return;

            var y = evalExpr(rpn, x);
            // canvas axis is upside down from math axis
            ctx.fillRect(xPx(x), canvas.height - yPx(y), 1, 1);

            // avoid totally clogging the browser... should use web workers here.
            setTimeout(function() { pixelFunc(i + 1); }, 0);
        }
        setTimeout(function() { pixelFunc(0); }, 0);
    }

    function onFormSubmit(e) {
        e.preventDefault();
        var form = this;
        var expr = $(form).children('[name=expr]').val();
        try {
            var rpn = parser.parse(expr, false)[0];

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
        history.initHistory();
        $('#mainForm').on('submit', onFormSubmit);
    }
    init();
});
