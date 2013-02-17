jQuery(function($) {
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
