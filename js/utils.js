exports.setup = function(){

	var utils = window.utils = {};

	var slice = Array.prototype.slice;

	utils.rebind = function rebind(fn, thisValue){
		var args = slice.call(arguments, 2);
		return function(){
			return fn.apply(thisValue, [this].concat(args, slice.call(arguments)));
		};
	};

	Element.prototype.addEventListeners = function(events){
		for (var name in events){
			if (!events.hasOwnProperty(name)) continue;
			var event = events[name];
			this.addEventListener(name, event, false);
		}
	};

	Element.prototype.removeEventListeners = function(events){
		for (var name in events){
			if (!events.hasOwnProperty(name)) continue;
			var event = events[name];
			this.removeEventListener(name, event, false);
		}
	};

};
