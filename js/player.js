exports.setup = function(sp, models, app){
	var player = models.player,
		Link = models.Link;
	
	var Player = window.Player = {

		_wakeupSource: '',
		_sleepSource: '',

		_wakeupTimer: null,
		_sleepTimer: null,

		init: function(){
			this.attach();
		},

		attach: function(){
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
			this.play(this._sleepSource);
			self.classList.remove('target');
		},

		onDropWake: function(self, e){
			console.log(e);
			if (e.stopPropagation) e.stopPropagation();
			this._wakeupSource = e.dataTransfer.getData('text');
			self.classList.remove('target');
		},

		setWake: function(hours, minutes){
			clearTimeout(this._wakeupTimer);
			this._wakeupTimer = setTimeout(this.play.bind(this, this._wakeupSource),
				this.ms(hours + 'h' + minutes + 'm'));
			return this;
		},

		setSleep: function(hours, minutes){
			clearTimeout(this._sleepTimer);
			this._sleepTimer = setTimeout(this.stop.bind(this), this.ms(hours + 'h' + minutes + 'm'));
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
