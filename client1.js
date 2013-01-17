jQuery(function($) {
    var numberRx = new RegExp('^( *' +
        '(?:[+-]?'          + // optional sign, then either
            '(?:(?:\\d*\\.\\d*)|'  + // fractional part, or...
            '(?:\\d+)))'           + // integer part,
        '(?:[eE][+-]?\\d+)? *)'); // then finally optional exponent
    var operatorRx = /^([-+*\/])/;

    function parseExpr(str) {
        str = str.trim();

        var numbers = [];
        var ops = [];
        var expectNumber = true; // expression must be alternative numbers & ops
        while(str.length > 0) {
            var rx = expectNumber ? numberRx : operatorRx;
            if(!rx.test(str))
                return null;
            if(expectNumber)
                numbers.push(Number(RegExp.$1));
            else
                ops.push(RegExp.$1);
            str = str.substring(RegExp.$1.length);
            expectNumber = !expectNumber;
        }
        if(expectNumber)
            return null; // ended in an operator
        return [numbers, ops];
    }

    function evalExpr(e) {
        var temp = parseExpr(e),
            numbers = temp[0],
            ops = temp[1];

        var acc = numbers[0];
        for(var i = 0; i < ops.length; i++) {
            acc = calculateWithHistory({
                arg1: acc,
                arg2: numbers[i + 1],
                op: ops[i],
            }).result;
        }
        return acc;
    }

    function onFormSubmit(e) {
        e.preventDefault();
        var form = this;
        var expr = $(form).children('[name=expr]').val();
        evalExpr(expr);
        return false;
    }

    function init() {
        initHistory();
        $('#mainForm').on('submit', onFormSubmit);
    }
    init();
});
