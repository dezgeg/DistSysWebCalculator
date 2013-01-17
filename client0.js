jQuery(function($) {
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

        calculateWithHistory(params);
    }

    function init() {
        $('#mainForm').on('submit', onFormSubmit);
        initHistory();
    }
    init();
});
