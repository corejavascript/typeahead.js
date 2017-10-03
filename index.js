'use strict';

module.exports = {
    "Promise": require("./lib/Promise.js"),
    "Bloodhound": require("./dist/bloodhound.js"),
    "loadjQueryPlugin": function() {require("./dist/typeahead.bundle.js");}
};
