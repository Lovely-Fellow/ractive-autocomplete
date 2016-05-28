var Ractive = require("ractive");
var AutoComplete = require("../index.js");

var results = [
	{ name: "test", id: 1 },
	{ name: "test2", id: 2 },
	{ name: "test3", id: 3 },
	{ name: "test33", id: 4 },
	{ name: "best", id: 5 }
];

window.onload = function() {
	
	Ractive.components.autocomplete = AutoComplete;
	
	var serverDelay = 250;
	
	var ractive = new Ractive({
		el: document.querySelector("#container"),
		template: document.querySelector("#template").innerHTML,
		data: function() {
			return {
				selection: { name: "test", id: 1 },
				suggest: function(text, callback) {
					setTimeout(function() { callback(null, results.filter(function(obj) {
						return obj.name.indexOf(text) == 0;
					}))}, serverDelay);
				}
			};
		}
	});
	
};
