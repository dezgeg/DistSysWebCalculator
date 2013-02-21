history = {
    STORAGE_KEY: "calcHistory",
    entries: null,
    initHistory: function() {
        try {
            history.entries = JSON.parse(localStorage[history.STORAGE_KEY] || '[]');
        } catch (e) {
            history.entries = [];
        }
        $.each(history.entries, function(i, calc) { history.addToView(calc); });
    },
    addCalculation: function(calculation) {
        history.entries.push(calculation);
        localStorage[history.STORAGE_KEY] = JSON.stringify(history.entries);
        history.addToView(calculation);
    },
    addToView: function(calculation) {
        var list = $('#calculationResults');
        var entry = $('<div>');
        entry.text(calculation);
        list.append(entry);
    },
    clearHistory: function() {
        $('#calculationResults').empty();
        history.entries = [];
        localStorage[history.STORAGE_KEY] = JSON.stringify(history.entries);
    },
};
