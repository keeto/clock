var timer;

var clock = {

	faces: [],
	currentFace: -1,

	addClockFace: function (clockFace) {
		return this.faces.push(clockFace) - 1;
	},

	useClockFace: function (clockFace) {
		if (this.faces[this.currentFace]) {
			this.faces[this.currentFace].uninit();
		}

		var index = this.faces.indexOf(clockFace);
		if (!~index) {
			index = this.addClockFace(clockFace);
		}
		this.currentFace = index;

		clockFace.init(this.canvas);
	},

	timer: function () {
		var date, hours, minutes, seconds, day, month, year;

		date = new Date();
		hours = date.getHours();
		minutes = date.getMinutes();
		seconds = date.getSeconds();
		day = date.getDate();
		month = date.getMonth();
		year = date.getFullYear();

		this.faces[this.currentFace].update(hours, minutes, seconds, day, month, year);
	}
};

exports.setup = function () {

	clock.canvas = document.getElementById('clock-face');

	// Include clock faces
	var clockFaceCards = sp.require('js/clockface-cards');
	clock.addClockFace(clockFaceCards);
	clock.useClockFace(clockFaceCards);

	// Set the timer
	if (clock.faces[clock.currentFace]) {
		timer = clock.timer.bind(clock);
		timer();
		setInterval(timer, 1000);
	}

};