jQuery(function($) {
    function onFormSubmit(e) {
        e.preventDefault();
        var form = this;
        var expr = $(form).children('[name=expr]').val();
        plot.hidePlot();
        try {
            var rpn = parser.parse(expr, false)[0];

            if (expr.indexOf('x') == -1)
                evalExpr(rpn, undefined, true);
            else
                plot.plotExpr(rpn);
        } catch(e) {
            alert(e);
        }
        return false;
    }

    function init() {
        history.initHistory();
        plot.initPlot();
        $('#mainForm').on('submit', onFormSubmit);
        $('#clearHistory').on('click', function(e) {
                history.clearHistory();
                e.preventDefault();
        });
    }
    init();
});
