jQuery(function($) {
    function onFormSubmit(e) {
        e.preventDefault();
        var form = this;
        var arg1 = parseFloat($(form).children('[name=arg1]').val()),
        var arg2 = parseFloat($(form).children('[name=arg2]').val()),
        var op   = $(form).children('[name=op]').val(),
        if(isNaN(params.arg1) || isNaN(params.arg2)) {
            alert('Enter valid numbers!');
            return false;
        }

        calc(arg1, op, arg2, true);
    }

    function init() {
        $('#mainForm').on('submit', onFormSubmit);
        initHistory();
    }
    init();
});
