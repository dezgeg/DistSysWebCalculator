jQuery(function($) {
    function onFormSubmit(e) {
        e.preventDefault();
        var form = this;
        var expr = $(form).children('[name=expr]').val();
        plot.hidePlot();
        try {
            var rpn = parser.parse(expr);

            if (expr.indexOf('x') == -1) {
                parser.evalExpr(rpn, calculate.onServerWithHistory);
            } else {
                switch($('[name=plotType] option:selected').val()) {
                    case 'plotImageOnServer':
                        plot.plotImageOnServer(rpn);
                        break;
                    case 'plotTrigLocally':
                        plot.plotToCanvas(rpn, calculate.onServerButTrigLocally);
                        break;
                    case 'plotTrigTaylorApproxLocally':
                        plot.plotToCanvas(rpn, calculate.onServer);
                        break;
                }
            }
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
