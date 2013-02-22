// window.history - the calculation history, which is stored in the
// browser's HTML5 localStorage.
history = {
    STORAGE_KEY: "calcHistory",     // key used for local storage
    entries: null,                  // array of the calculations, as an array of strings

    // Initialize the history. Loads everything from the localStorage,
    // and adds them all to the view.
    initHistory: function() {
        try {
            history.entries = JSON.parse(localStorage[history.STORAGE_KEY] || '[]');
        } catch (e) {
            history.entries = [];
        }
        $.each(history.entries, function(i, calc) { history.addToView(calc); });
    },
    // Add an calculation (i.e. any string) to the history.
    // The value is added to the #calculationResults div and saved
    // to localStorage.
    addCalculation: function(calculation) {
        history.entries.push(calculation);
        localStorage[history.STORAGE_KEY] = JSON.stringify(history.entries);
        history.addToView(calculation);
    },
    // Internal. Adds the calculation just to the view.
    addToView: function(calculation) {
        var list = $('#calculationResults');
        var entry = $('<div>');
        entry.text(calculation);
        list.append(entry);
    },
    // Clears the history, both the view and the local storage.
    clearHistory: function() {
        $('#calculationResults').empty();
        history.entries = [];
        localStorage[history.STORAGE_KEY] = JSON.stringify(history.entries);
    },
};
