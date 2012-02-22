var clockFace = {

	lastDate: {},

	init: function (canvasElement) {
		var canvas = this.canvas = oCanvas.create({
			canvas: canvasElement
		});

		var card = canvas.display.rectangle({
			x: 20,
			y: 0,
			width: 110,
			height: 200,
			fill: '#212121',
			join: 'round',
			stroke: '40px #212121'
		});

		var digit = canvas.display.text({
			x: 55,
			y: 105,
			origin: { x: 'center', y: 'center' },
			font: 'bold 200px Helvetica Neue, sans-serif',
			text: '0',
			fill: '#d8d8d8'
		});
		card.addChild(digit);

		var cards = this.cards = [];
		var c, r, clone;

		var date = new Date();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		this.lastDate = { h: hours, min: minutes };
		hours = this.getSplitDigits(hours);
		minutes = this.getSplitDigits(minutes);
		var digits = [hours[0], hours[1], minutes[0], minutes[1]];

		for (c = 0; c < 4; c++) {
			for (r = 0; r < 2; r++) {
				clone = card.clone({
					x: 20 + c * 160 + (c > 1 ? 40 : 0),
					y: r * -250,
					digitType: c < 2 ? 'hour' : 'minute'
				}).add();
				cards.push(clone);
				clone.children[0].text = this.getDigit(clone, c < 2 ? date.getHours() : date.getMinutes(), c, digits[c] + r);;
			}
		}

		window.addEventListener('focus', function () {
			clockFace.forceUpdate();
		}, false);

	},

	uninit: function () {
		this.canvas.clear();
	},

	update: function (hours, minutes, seconds, day, month, year) {
		if (this.lastDate.h === hours && this.lastDate.min === minutes) {
			return;
		}

		var hour1, hour2, minute1, minute2;

		if (this.lastDate.h !== hours) {
			hour1 = parseInt(hours / 10) === parseInt(this.lastDate.h / 10);
			hour2 = hours % 10 === this.lastDate.h % 10;
			if (!hour1 && (hours >= 10 || hours < this.lastDate.h)) {
				this.moveCards(0, this.lastDate.h);
			}
			if (!hour2) {
				this.moveCards(1, this.lastDate.h);
			}
		}
		if (this.lastDate.min !== minutes) {
			minute1 = parseInt(minutes / 10) === parseInt(this.lastDate.min / 10);
			minute2 = minutes % 10 === this.lastDate.min % 10;
			if (!minute1 && (minutes >= 10 || minutes < this.lastDate.min)) {
				this.moveCards(2, this.lastDate.min);
			}
			if (!minute2) {
				this.moveCards(3, this.lastDate.min);
			}
		}

		this.lastDate = { h: hours, min: minutes, s: seconds, m: month, y: year };

		this.canvas.redraw();
	},

	forceUpdate: function () {
		var cards = this.cards;
		var c, r, clone, i;

		var date = new Date();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		this.lastDate = { h: hours, min: minutes };
		hours = this.getSplitDigits(hours);
		minutes = this.getSplitDigits(minutes);
		var digits = [hours[0], hours[1], minutes[0], minutes[1]];

		for (i = 0; i < 8; i++) {
			c = parseInt(i / 2);
			r = i % 2;
			cards[i].children[0].text = this.getDigit(cards[i], c < 2 ? date.getHours() : date.getMinutes(), c, digits[c] + r);
		}
		this.canvas.redraw();
	},

	moveCards: function (col, fullValue) {
		var self, card1, card2;
		self = this;
		card1 = this.cards[col * 2];
		card2 = this.cards[col * 2 + 1];

		card1.animate({ y: card1.y + 250 }, 500, function () {
			this.y = -250;
			var digit = this.children[0];
			digit.text = self.getDigit(card1, fullValue, col, parseInt(digit.text) + 2);
			self.cards[col * 2] = card2;
			self.cards[col * 2 + 1] = card1;
		});
		card2.animate({ y: card2.y + 250 }, 500);
	},

	getSplitDigits: function (input) {
		var digit1 = input < 10 ? 0 : (input - input % 10) / 10;
		var digit2 = input < 10 ? input : input % 10;
		return [digit1, digit2];
	},

	getDigit: function (obj, fullValue, col, digit) {
		var isHour = obj.digitType === 'hour';
		var isMinute = obj.digitType === 'minute';
		var isFirstDigit = (isHour && col === 0) || (isMinute && col === 2);
		if (isMinute && isFirstDigit && digit > 5) {
			digit = 0;
		}
		if (isHour && isFirstDigit && digit > 2) {
			digit = 0;
		}
		if (isHour && !isFirstDigit && fullValue > 19 && digit > 3) {
			digit = 0;
		}
		if (digit >= 10) {
			digit -= 10;
		}

		return digit;
	}
};

exports.init = clockFace.init.bind(clockFace);
exports.uninit = clockFace.uninit.bind(clockFace);
exports.update = clockFace.update.bind(clockFace);
