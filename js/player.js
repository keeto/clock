exports.setup = function(sp, models, app){
	var player = models.player,
		Link = models.Link;
	
	var Player = window.Player = {

		_wakeupSource: '',
		_sleepSource: '',

		_wakeupTimer: null,
		_sleepTimer: null,

		_wakeupTimeMode: 'duration',
		_sleepTimeMode: 'duration',

		init: function(){
			this.attach();
		},

		attach: function(){
			// mode toggles
			var sleepContainer = document.querySelector('.col.sleep'),
				wakeupContainer = document.querySelector('.col.wake-up');

			var toggle = sleepContainer.querySelectorAll('.toggle');
			toggle[0].addEventListener('click', utils.rebind(this.toggleMode, this, 'sleep', 'time', toggle[1]));
			toggle[1].addEventListener('click', utils.rebind(this.toggleMode, this, 'sleep', 'duration', toggle[0]));
			sleepContainer.querySelector('.start-sleep').addEventListener('click', utils.rebind(this.setSleep, this));
			this._sleepValues = {
				hours: document.getElementById('sleep-hours'),
				mins: document.getElementById('sleep-minutes')
			};

			toggle = wakeupContainer.querySelectorAll('.toggle');
			toggle[0].addEventListener('click', utils.rebind(this.toggleMode, this, 'wakeup', 'time', toggle[1]));
			toggle[1].addEventListener('click', utils.rebind(this.toggleMode, this, 'wakeup', 'duration', toggle[0]));
			wakeupContainer.querySelector('.start-wake').addEventListener('click', utils.rebind(this.setWake, this));
			this._wakeValues = {
				hours: document.getElementById('wake-hours'),
				mins: document.getElementById('wake-minutes')
			};


			// targets
			var targets = this._targets = document.querySelectorAll('.droparea');
			for (var i = 0, l = targets.length; i < l; i++){
				var target = targets[i];
				target.addEventListeners({
					'dragenter': utils.rebind(this.onDragEnter, this),
					'dragover': utils.rebind(this.onDragOver, this),
					'dragleave': utils.rebind(this.onDragLeave, this),
					'drop': utils.rebind(target.parentNode.classList.contains('sleep')
						? this.onDropSleep : this.onDropWake, this)
				});
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
				console.log(s);
				if (s == Number(s)) return Number(s);
				r.exec(s.toLowerCase());
				return RegExp.$1 * _[RegExp.$2];
			};
		})(),

		onDragEnter: function(self, e){
			self.classList.add('target');
		},

		onDragLeave: function(self, e){
			self.classList.remove('target');
		},

		onDragOver: function(self, e){
			if (e.preventDefault) e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
			self.classList.add('target');
		},

		onDropSleep: function(self, e){
			if (e.stopPropagation) e.stopPropagation();
			this._sleepSource = e.dataTransfer.getData('text');
			self.classList.remove('target');
		},

		onDropWake: function(self, e){
			if (e.stopPropagation) e.stopPropagation();
			this._wakeupSource = e.dataTransfer.getData('text');
			self.classList.remove('target');
		},

		toggleMode: function(self, which, mode, other){
			this['_' + which + 'TimeMode' ] = mode;
			other.classList.remove('active');
			self.classList.add('active');
			return this;
		},

		calculateTimeDiff: function(hours, minutes){
			var current = new Date(),
				forward = new Date();
			
			forward.setHours(hours, minutes, 0);
			if (forward < current){
				forward.setHours(hours + 24, minutes, 0);
			}

			return forward - current;
		},

		setWake: function(self, e){
			var values = this._wakeValues,
				hours = parseInt(values.hours.value, 10),
				minutes = parseInt(values.mins.value, 10),
				timestamp = 0;

			if (this._wakeupTimeMode == 'duration'){
				timestamp = this.ms(hours + 'h') + this.ms(minutes + 'm');
			} else {
				timestamp = this.calculateTimeDiff(hours, minutes);
			}

			clearTimeout(this._wakeupTimer);
			this._wakeupTimer = setTimeout(this.play.bind(this, this._wakeupSource), timestamp);
			return this;
		},

		setSleep: function(self, e){
			var values = this._sleepValues,
				hours = parseInt(values.hours.value, 10),
				minutes = parseInt(values.mins.value, 10),
				timestamp = 0;


			if (this._sleepTimeMode == 'duration'){
				timestamp = this.ms(hours + 'h') + this.ms(minutes + 'm');
			} else {
				timestamp = this.calculateTimeDiff(hours, minutes);
			}

			clearTimeout(this._sleepTimer);
			this._sleepTimer = setTimeout(this.stop.bind(this), timestamp);
			return this;
		},

		play: function(source){
			switch (Link.getType(source)){
				case Link.TYPE.ALBUM:
					source = models.Album.fromURI(source);
				break;
				case Link.TYPE.PLAYLIST:
					source = models.Playlist.fromURI(source);
				break;
				case Link.TYPE.TRACK:
					var _temp = source;
					source = new models.Playlist();
					source.add(_temp);
					source.add(_temp);
				break;
				default:
					source = null;
			}
				
			player.repeat = true;
			player.play(source.get(0), source, 0);
			return this;
		},

		stop: function(){
			player.playing = false;
			return this;
		}

	};

	Player.init();

};
