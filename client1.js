// Tuomas Tynkkynen, 013770385
jQuery(function($) {
    function onFormSubmit(e) {
        e.preventDefault();
        var form = this;
        var expr = $(form).children('[name=expr]').val();
        plot.hidePlot();
        try {
            var rpn = parser.parse(expr);

            if (expr.indexOf('x') == -1) {
                if (rpn.length != 1) {
                    parser.evalExpr(rpn, calculate.onServerWithHistory);
                } else {
                    // If there's nothing to actually calculate,
                    // evalExpr won't add anything to history.
                    // So do this manually to make it look not stupid.
                    history.addCalculation('' + rpn[0]);
                }
            } else {
                switch($('[name=plotType] option:selected').val()) {
                    case 'plotImageOnServer':
                        plot.plotImageOnServer(rpn);
                        break;
                    case 'plotLocally':
                        plot.plotToCanvas(rpn, calculate.locally);
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
