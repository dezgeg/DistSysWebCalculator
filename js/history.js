// // Tuomas Tynkkynen, 013770385
// window.calculationHistory - the calculation calculationHistory, which is stored in the
// browser's HTML5 localStorage.
calculationHistory = {
    STORAGE_KEY: "calcHistory",     // key used for local storage
    entries: null,                  // array of the calculations, as an array of strings

    // Initialize the calculationHistory. Loads everything from the localStorage,
    // and adds them all to the view.
    initHistory: function() {
        try {
            calculationHistory.entries = JSON.parse(localStorage[calculationHistory.STORAGE_KEY] || '[]');
        } catch (e) {
            calculationHistory.entries = [];
        }
        $.each(calculationHistory.entries, function(i, calc) { calculationHistory.addToView(calc); });
    },
    // Add an calculation (i.e. any string) to the calculationHistory.
    // The value is added to the #calculationResults div and saved
    // to localStorage.
    addCalculation: function(calculation) {
        calculationHistory.entries.push(calculation);
        localStorage[calculationHistory.STORAGE_KEY] = JSON.stringify(calculationHistory.entries);
        calculationHistory.addToView(calculation);
    },
    // Internal. Adds the calculation just to the view.
    addToView: function(calculation) {
        var list = $('#calculationResults');
        var entry = $('<div>');
        entry.text(calculation);
        list.append(entry);
    },
    // Clears the calculationHistory, both the view and the local storage.
    clearHistory: function() {
        $('#calculationResults').empty();
        calculationHistory.entries = [];
        localStorage[calculationHistory.STORAGE_KEY] = JSON.stringify(calculationHistory.entries);
    },
};
