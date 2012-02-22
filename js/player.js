exports.setup = function(sp, models, views, app){
	var player = models.player,
		Link = models.Link,
		_Image = views.Image;
	
	var Player = window.Player = {

		_wakeupSource: '',
		_sleepSource: '',

		_wakeupTimer: null,
		_sleepTimer: null,

		_wakeupTimeMode: 'time',
		_sleepTimeMode: 'duration',

		init: function(){
			this.attach();
			this.readState();
		},

		attach: function(){
			// mode toggles
			var sleepContainer = this._sleepContainer = document.querySelector('.col.sleep'),
				wakeupContainer = this._wakeupContainer = document.querySelector('.col.wake-up');

			var toggle = sleepContainer.querySelectorAll('.toggle');
			toggle[0].addEventListener('click', utils.rebind(this.toggleMode, this, 'sleep', 'time', toggle[1]));
			toggle[1].addEventListener('click', utils.rebind(this.toggleMode, this, 'sleep', 'duration', toggle[0]));

			var sleepStart = this._sleepStart = sleepContainer.querySelector('.start-sleep');
			sleepStart.addEventListener('click', utils.rebind(this.setSleep, this));

			this._sleepValues = {
				hours: document.getElementById('sleep-hours'),
				mins: document.getElementById('sleep-minutes')
			};

			toggle = wakeupContainer.querySelectorAll('.toggle');
			toggle[0].addEventListener('click', utils.rebind(this.toggleMode, this, 'wakeup', 'time', toggle[1]));
			toggle[1].addEventListener('click', utils.rebind(this.toggleMode, this, 'wakeup', 'duration', toggle[0]));

			var wakeupStart = this._wakeupStart = wakeupContainer.querySelector('.start-wake');
			wakeupStart.addEventListener('click', utils.rebind(this.setWake, this));

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

		clearState: function(){
			localStorage['clock-state'] = null;
			return this;
		},

		readState: function(){
			var data = JSON.parse(localStorage['clock-state'] || 'null');
			if (!data) return this;
			var source = this._wakeupSource = data._wakeupSource;
			if (source){
				this.showMusicInfo(this._wakeupContainer.querySelector('.droparea'), source);
				this._wakeupStart.disabled = false;
			}

			source = this._sleepSource = data._sleepSource;
			if (source){
				this.showMusicInfo(this._sleepContainer.querySelector('.droparea'), source);
				this._sleepStart.disabled = false;
			}

			var mode = this._wakeupTimeMode = data._wakeupTimeMode;
			var toggle = this._wakeupContainer.querySelectorAll('.toggle');
			toggle[mode == 'time' ? '0' : '1'].classList.add('active');
			toggle[mode == 'time' ? '1' : '0'].classList.remove('active');

			mode = this._sleepTimeMode = data._sleepTimeMode;
			toggle = this._sleepContainer.querySelectorAll('.toggle');
			toggle[mode == 'time' ? '0' : '1'].classList.add('active');
			toggle[mode == 'time' ? '1' : '0'].classList.remove('active');

			this._wakeValues.hours.value = data._wakeupHours;
			this._wakeValues.mins.value = data._wakeupMinutes;

			this._sleepValues.hours.value = data._sleepHours;
			this._sleepValues.mins.value = data._sleepMinutes;
		},

		flushState: function(){
			if (this._flushTimer) clearTimeout(this._flushTimer);
			var data = JSON.stringify({
				_wakeupSource: this._wakeupSource,
				_sleepSource: this._sleepSource,
				_wakeupTimeMode: this._wakeupTimeMode,
				_sleepTimeMode: this._sleepTimeMode,
				_wakeupHours: this._wakeValues.hours.value,
				_wakeupMinutes: this._wakeValues.mins.value,
				_sleepHours: this._sleepValues.hours.value,
				_sleepMinutes: this._sleepValues.mins.value
			});
			this._flushTimer = setTimeout(function(){
				localStorage['clock-state'] = data;
			}, 10);
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
			this.showMusicInfo(self, this._sleepSource);
			self.classList.remove('target');
			this._sleepStart.disabled = false;
			this.flushState();
		},

		onDropWake: function(self, e){
			if (e.stopPropagation) e.stopPropagation();
			this._wakeupSource = e.dataTransfer.getData('text');
			this.showMusicInfo(self, this._wakeupSource);
			self.classList.remove('target');
			this._wakeupStart.disabled = false;
			this.flushState();
		},

		toggleMode: function(self, which, mode, other){
			this['_' + which + 'TimeMode' ] = mode;
			other.classList.remove('active');
			self.classList.add('active');
			this.flushState();
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
			clearTimeout(this._wakeupTimer);
			if (self.classList.contains('start')){
				var values = this._wakeValues,
					hours = parseInt(values.hours.value, 10),
					minutes = parseInt(values.mins.value, 10),
					timestamp = 0;

				if (this._wakeupTimeMode == 'duration'){
					timestamp = this.ms(hours + 'h') + this.ms(minutes + 'm');
				} else {
					timestamp = this.calculateTimeDiff(hours, minutes);
				}

				this._wakeupTimer = setTimeout(function(){
					this.play(this._wakeupSource);
					this.toggleButtonState(self, 'start', 'alarm');
					this.enableControls(this._wakeupContainer);
				}.bind(this), timestamp);
				this.toggleButtonState(self, 'stop', 'alarm');
				this.disableControls(this._wakeupContainer);
			} else {
				this.toggleButtonState(self, 'start', 'alarm');
				this.enableControls(this._wakeupContainer);
			}
			this.flushState();
			return this;
		},

		setSleep: function(self, e){
			clearTimeout(this._sleepTimer);
			if (self.classList.contains('start')){
				var values = this._sleepValues,
					hours = parseInt(values.hours.value, 10),
					minutes = parseInt(values.mins.value, 10),
					timestamp = 0;


				if (this._sleepTimeMode == 'duration'){
					timestamp = this.ms(hours + 'h') + this.ms(minutes + 'm');
				} else {
					timestamp = this.calculateTimeDiff(hours, minutes);
				}

				if (this._sleepSource) this.play(this._sleepSource);
				this._sleepTimer = setTimeout(function(){
					this.stop();
					this.toggleButtonState(self, 'start', 'music');
					this.enableControls(this._sleepContainer);
				}.bind(this), timestamp);
				this.toggleButtonState(self, 'stop', 'music');
				this.disableControls(this._sleepContainer);
			} else {
				this.stop();
				this.toggleButtonState(self, 'start', 'music');
				this.enableControls(this._sleepContainer);
			}
			this.flushState();
			return this;
		},

		toggleButtonState: function(self, mode, what){
			if (mode == 'stop'){
				self.classList.remove('start');
				self.classList.add('stop');
				self.innerText = 'Stop the ' + what;
			} else {
				self.classList.remove('stop');
				self.classList.add('start');
				self.innerText = 'Start the ' + what;
			}
		},

		getSourceObject: function(source, callback){
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
					source.isSingleTrack = true;
				break;
				default:
					source = null;
			}

			if (source !== null) {
				if (source.loaded) {
					if (source.isSingleTrack) {
						source.trackName = source.get(0).name;
					}
					callback(source);
				} else {
					source.observe(models.EVENT.LOAD, function handler(){
						if (source.isSingleTrack) {
							source.trackName = source.get(0).name;
						}
						callback(source);
						source.ignore(models.EVENT.LOAD, handler);
					});
				}
			}

			return source;
		},

		play: function(source){
			this.getSourceObject(source, function (source) {
				player.repeat = true;
				player.play(source.get(0), source, 0);
			});
			return this;
		},

		stop: function(){
			player.playing = false;
			return this;
		},

		showMusicInfo: function(dropElement, source){
			this.getSourceObject(source, function(source){
				var instructions, music, image, title, numtracks, numTracks;

				instructions = dropElement.querySelector('.instructions');
				instructions.classList.add('hidden');
				music = dropElement.querySelector('.music');
				music.classList.remove('hidden');

				image = new _Image(source.image).node;
				music.querySelector('.image').innerHTML = '';
				music.querySelector('.image').appendChild(image);

				title = music.querySelector('.title');
				title.innerHTML = source.isSingleTrack ? source.trackName : source.name;

				numtracks = music.querySelector('.numtracks');
				numTracks = source.isSingleTrack ? 1 : source.length;
				numtracks.innerHTML = numTracks + (numTracks === 1 ? ' track' : ' tracks');
			});
		},

		enableControls: function(container){
			container.querySelector('.form').classList.remove('disabled');
			container.querySelector('.droparea').classList.remove('disabled');
		},

		disableControls: function(container){
			container.querySelector('.form').classList.add('disabled');
			container.querySelector('.droparea').classList.add('disabled');
		}

	};

	Player.init();

};
