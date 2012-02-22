"use strict";

var selectify = {

	setup: function (selector) {
		var elems = document.querySelectorAll(selector);

		for (var i = 0; i < elems.length; i++) {
			elems[i].addEventListener('change', this.change.bind(this, elems[i]), false);
		}
	},

	change: function (elem) {
		var textValue, chosenValue;
		textValue = elem.querySelector('.styled-select-value');
		chosenValue = elem.querySelector('select').value;
		textValue.innerHTML = chosenValue;
	}
};

exports.setup = selectify.setup.bind(selectify);