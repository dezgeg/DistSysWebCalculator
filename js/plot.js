// window.plot - plotting graphs
// Implements two methods of plotting a function,
// to a PNG image with gnuplot on the server (see server.php)
// and to a HTML5 canvas.
// Plot parameters
var plotConfig = {
    STEP: 0.05,         // width of each pixel

    XMIN: -3.2,         // range of the plot
    XMAX: 3.2,
    YMIN: -1.2,
    YMAX: 1.2,

    TICK: 0.5,          // plot ticks every this units
    TICK_SIZE: 2,       // tick size in pixels
    LONG_TICK_EVERY: 2, // make every n:th tick longer
    TICK_SIZE_LONG: 3,
};
// convert an x value to pixel coordinates on the x-axis
var xPx = function(x) {
    return Math.round((x - plotConfig.XMIN) / plotConfig.STEP);
}
// convert an y value to pixel coordinates on the y-axis
var yPx = function(y) {
    return Math.round((y - plotConfig.YMIN) / plotConfig.STEP);
}
// draw a line in pixel coords, from (sx, sy) -> (ex, ey)
var drawLine = function(ctx, sx, sy, ex, ey) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
}

// Initialize the canvas
// Set proper size, and draw plot axes and axis ticks
var initCanvas = function(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';

    // Set canvas & dialog size (since div fitting to its contents seems not to work)
    // Also clears the canvas.
    canvas.width = Math.round((plotConfig.XMAX - plotConfig.XMIN) / plotConfig.STEP) + 1;
    canvas.height = Math.round((plotConfig.YMAX - plotConfig.YMIN) / plotConfig.STEP) + 1;
    plot.dialog.height(canvas.height);
    plot.dialog.width(canvas.width);

    ctx.fillStyle = '#000000';
    ctx.lineWidth = 1.0;
    // fixes ugly anti-aliasing problems
    ctx.translate(0.5, 0.5);

    // Origin in pixel coords
    var originXpx = xPx(0.0), originYpx = yPx(0.0);
    // axes
    drawLine(ctx, 0, originYpx, canvas.width, originYpx);
    drawLine(ctx, originXpx, 0, originXpx, canvas.height);
    // axis ticks
    for(var i = 1; ; i++) {
        var c = plotConfig.TICK * i;
        if (c > plotConfig.XMAX && c > plotConfig.YMIN)
            break;

        var w = (i % plotConfig.LONG_TICK_EVERY) != 0 ? plotConfig.TICK_SIZE : plotConfig.TICK_SIZE_LONG;

        drawLine(ctx, xPx(c), originYpx - w, xPx(c), originYpx + w);    // positive x-axis
        drawLine(ctx, xPx(-c), originYpx - w, xPx(-c), originYpx + w);  // negative x-axis
        drawLine(ctx, originXpx - w, yPx(c), originXpx + w, yPx(c));    // negative y-axis
        drawLine(ctx, originXpx - w, yPx(-c), originXpx + w, yPx(-c));  // positive y-axis
    }
}

// Convert an rpn expression to a gnuplot-compatible
// infix expression. It can't be passed directly to
// the server because gnuplot has proper operator 
// precedence.
var rpnToInfix = function(rpn) {
    var exprStack = [];
    for(var i = 0; i < rpn.length; i++) {
        if(typeof(rpn[i]) === 'number') {
            exprStack.push(rpn[i]);
        } else if (rpn[i] == 'x') {
            exprStack.push('x');
        } else if (parser.isUnaryTrigOp(rpn[i])) {
            exprStack.push(rpn[i] + '(' + exprStack.pop() + ')');
        } else {
            var arg2 = exprStack.pop();
            var arg1 = exprStack.pop();
            exprStack.push('(' + arg1 + ') ' + rpn[i] + ' (' + arg2 + ')');
        }
    }
    return exprStack[0];
}

plot = {
    // Initialize the plot object.
    initPlot: function() {
        plot.dialog = $('#graphDialog');
        plot.canvas = $('#graphDialog canvas');
        plot.img = $('#graphDialog img');
        plot.dialog.on('click', function() {
            plot.dialog.hide();
        });
    },
    // Stop the asynch canvas plotting, if there is one ongoing
    stopPlot: function() {
        if (plot.timeoutId)
            clearTimeout(plot.timeoutId);
        plot.timeoutId = undefined;
    },
    // Hides the plot.
    hidePlot: function() {
        plot.stopPlot();
        plot.dialog.hide();
    },
    // Plot the RPN expression on the server
    plotImageOnServer: function(rpn) {
        var infix = rpnToInfix(rpn);

        plot.stopPlot();
        plot.canvas.hide();
        plot.img.attr('src', 'server.php?plot=' + encodeURIComponent(infix));
        plot.img.show();
        plot.dialog.show();
    },
    // Plot the RPN expression locally to a HTML5 canvas
    plotToCanvas: function(rpn, calcFn) {
        plot.stopPlot();
        plot.img.hide();
        plot.canvas.show();

        var canvas = plot.canvas[0];
        var ctx = canvas.getContext('2d');
        initCanvas(canvas);
        plot.dialog.show();

        ctx.fillStyle = '#ff0000';

        // Do the pixel plots inside a setTimeout so that
        // the whole browser doesn't hang
        var pixelFunc = function(i) {
            // Stop plotting if the dialog was hidden.
            if (plot.dialog.css('display') === 'none')
                return;

            var x = plotConfig.XMIN + i * plotConfig.STEP;

            // Finished?
            if (x > plotConfig.XMAX)
                return;

            var y = parser.evalExpr(rpn, calcFn, x);
            // canvas axis is upside down from math axis
            ctx.fillRect(xPx(x), canvas.height - yPx(y), 1, 1);

            plot.timeoutId = setTimeout(function() { pixelFunc(i + 1); }, 0);
        }
        plot.timeoutId = setTimeout(function() { pixelFunc(0); }, 0);
    }
}
