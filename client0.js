jQuery(function($) {
    var history;

    function addToHistoryView(calculation) {
        console.log(calculation);
    }

    function calculate(params, onSuccess) {
        return $.getJSON('server.php', params, function(data) {
            if(!data || data.error || !data.result) {
                alert('Sorry, error! See console for details.');
                console.log('Error:', data.error);
                return;
            }
            var calculation = {};
            for(k in params)
                calculation[k] = params[k];
            calculation.result = data.result;
            onSuccess(calculation);
        });
    }

    function onFormSubmit(e) {
        e.preventDefault();
        var form = this;
        var params = {
            arg1: parseFloat($(form).children('[name=arg1]').val()),
            arg2: parseFloat($(form).children('[name=arg2]').val()),
            op: $(form).children('[name=op]').val(),
        }
        if(isNaN(params.arg1) || isNaN(params.arg2)) {
            alert('Enter valid numbers!');
            return false;
        }

        calculate(params, function(calc) {
            history.push(calc);
            addToHistoryView(calc);
            window.localStorage.calcHistory = JSON.stringify(history);
        });
        return;
    }

    function init() {
        history = JSON.parse(window.localStorage.calcHistory || '[]');
        $.each(history, function(i, calc) { addToHistoryView(calc); });
        $('#mainForm').on('submit', onFormSubmit);
    }
    init();
});
