exports.setup = function(sp, models, app){
	var player = models.player;
	
	// Drag and Drop
	var Player = window.Player = {

		_wakeupSource: '',
		_sleepSource: '',

		_wakeupTimer: null,
		_sleepTimer: null,

		init: function(){
			this.attach();
		},

		attach: function(){
			var targets = document.querySelectorAll('.droparea');
			for (var i = 0, l = targets.length; i < l; i++){
				var target = targets[i];
				target.addEventListener('dragover', this.onDragOver.bind(this));
				target.addEventListener('drop', (target.parentNode.classList.contains('sleep')
					? this.onDropSleep : this.onDropWake).bind(this));
			}
		},

		ms: (function(){
			var r = /(\d*.?\d+)([mshd]+)/, _ = {};
			_.ms = 1;
			_.s = 1000;
			_.m = _.s * 60;
			_.h = _.m * 60;
			_.d = _.h * 24;
			return function ms(s) {
				if (s == Number(s)) return Number(s);
				r.exec(s.toLowerCase());
				return RegExp.$1 * _[RegExp.$2];
			};
		})(),

		onDragOver: function(e){
			if (e.preventDefault) e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
		},

		onDropSleep: function(e){
			if (e.stopPropagation) e.stopPropagation();
			this._sleepSource = e.dataTransfer.getData('text');
		},

		onDropWake: function(e){
			if (e.stopPropagation) e.stopPropagation();
			this._wakeupSource = e.dataTransfer.getData('text');
		},

		setWake: function(hours, minutes){
			clearTimeout(this._wakeupTimer);
			this._wakeupTimer = setTimeout(this.play.bind(this), this.ms(hours + 'h' + minutes + 'm'));
			return this;
		},

		setSleep: function(hours, minutes){
			clearTimeout(this._sleepTimer);
			this._sleepTimer = setTimeout(this.stop.bind(this), this.ms(hours + 'h' + minutes + 'm'));
			return this;
		},

		play: function(){
			var playlist = models.Playlist.fromURI(this._wakeupSource);
			player.play(playlist.get(0), playlist, 0);
			return this;
		},

		stop: function(){
			player.playing = false;
			return this;
		}

	};

	Player.init();

};
