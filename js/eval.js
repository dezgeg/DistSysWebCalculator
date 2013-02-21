eval = {
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
    }
};
