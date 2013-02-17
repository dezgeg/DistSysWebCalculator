var plotConfig = {
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
var xPx = function(x) {
    return Math.round((x - plotConfig.XMIN) / plotConfig.STEP);
}
var yPx = function(y) {
    return Math.round((y - plotConfig.YMIN) / plotConfig.STEP);
}
// draw a line in pixel coords
var drawLine = function(ctx, sx, sy, ex, ey) {
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
}

function initCanvas(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    // also clears
    canvas.width = Math.round((plotConfig.XMAX - plotConfig.XMIN) / plotConfig.STEP) + 1;
    canvas.height = Math.round((plotConfig.YMAX - plotConfig.YMIN) / plotConfig.STEP) + 1;
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 1.0;
    // fixes ugly anti-aliasing problems
    ctx.translate(0.5, 0.5);

    var originXpx = xPx(0.0), originYpx = yPx(0.0);
    // axes
    drawLine(ctx, 0, originYpx, canvas.width, originYpx);
    drawLine(ctx, originXpx, 0, originXpx, canvas.height);
    // x,y ticks
    for(var i = 1; ; i++) {
        var c = plotConfig.TICK * i;
        if (c > plotConfig.XMAX && c > plotConfig.YMIN)
            break;

        var w = (i % 5) != 0 ? plotConfig.TICK_SIZE : plotConfig.TICK_SIZE_LONG;

        drawLine(ctx, xPx(c), originYpx - w, xPx(c), originYpx + w);
        drawLine(ctx, xPx(-c), originYpx - w, xPx(-c), originYpx + w);
        drawLine(ctx, originXpx - w, yPx(c), originXpx + w, yPx(c));
        drawLine(ctx, originXpx - w, yPx(-c), originXpx + w, yPx(-c));
    }
}

function plotExpr(rpn) {
    var canvas = $('#graph')[0];
    var ctx = canvas.getContext('2d');
    initCanvas(canvas);

    ctx.fillStyle = '#ff0000';
    var pixelFunc = function(i) {
        var x = plotConfig.XMIN + i * plotConfig.STEP;
        if (x > plotConfig.XMAX)
            return;

        var y = evalExpr(rpn, x);
        // canvas axis is upside down from math axis
        ctx.fillRect(xPx(x), canvas.height - yPx(y), 1, 1);

        // avoid totally clogging the browser... should use web workers here.
        setTimeout(function() { pixelFunc(i + 1); }, 0);
    }
    setTimeout(function() { pixelFunc(0); }, 0);
}
