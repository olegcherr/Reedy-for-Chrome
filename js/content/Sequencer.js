

(function(app) {
	
	function getSinFactor(num, min, max) {
		return Math.sin(PI2 * (num-min) / (max-min));
	}
	
	function getWpmReducing(wasReadingLaunchedSinceOpen) {
		return wasReadingLaunchedSinceOpen ? INIT_WPM_REDUCE_1 : INIT_WPM_REDUCE_0;
	}
	
	
	
	var INIT_WPM_REDUCE_0   = 0.5,  // from 0 to 1 - wpm reduce factor for the FIRST start (more value means higher start wpm)
		INIT_WPM_REDUCE_1   = 0.6,  // from 0 to 1 - wpm reduce factor for the FOLLOWING starts (more value means higher start wpm)
		ACCEL_CURVE         = 3,    // from 0 to infinity - more value means more smooth acceleration curve
		PI2                 = Math.PI/2;
	
	
	app.Sequencer = function(raw, data) {
		
		function getTiming(isDelayed) {
			var gradualAccel = app.get('gradualAccel'),
				targetWpm = app.get('wpm'), res;
			
			
			if (gradualAccel && wpm < targetWpm && startWpm < targetWpm) {
				if (wpm)
					wpm += 50 / (1 + ACCEL_CURVE*getSinFactor(wpm, startWpm, targetWpm));
				else
					wpm = startWpm = targetWpm*getWpmReducing(wasLaunchedSinceOpen);
				
				if (wpm >= targetWpm)
					wpm = targetWpm;
			}
			else {
				wpm = targetWpm;
			}
			
			// Don't allow `startWpm` to get gte than `targetWpm`
			if (startWpm >= targetWpm)
				startWpm = targetWpm;
			
			
			res = 60000/wpm;
			
			if (gradualAccel && !wasLaunchedSinceOpen)
				res /= 1.5;
			
			if (!wasLaunchedSinceOpen || isDelayed && app.get('smartSlowing'))
				res *= 2;
			
			return res;
		}
		
		function next(justRun) {
			clearTimeout(timeout);
			
			if (!api.isRunning) return;
			
			if (api.index >= length-1) {
				setTimeout(function() {
					api.pause();
				}, 500);
			}
			else {
				justRun || api.toNextToken();
				token = api.getToken();
				
				function doUpdate() {
					var hyphenated = app.get('hyphenation') ? token.toHyphenated() : [token.toString()],
						i = -1;
					
					(function go() {
						if (hyphenated[++i]) {
							app.trigger(api, 'update', [hyphenated[i]+(i < hyphenated.length-1 ? '-' : '')]);
							timeout = setTimeout(go, getTiming(token.getComplexity() === 2));
						}
						else {
							next();
						}
					})();
				}
				
				if (!justRun && api.index && data[api.index-1].isSentenceEnd && app.get('emptySentenceEnd')) {
					app.trigger(api, 'update', [false]);
					timeout = setTimeout(doUpdate, getTiming(true));
				}
				else {
					doUpdate();
				}
			}
		}
		
		
		
		var api = this,
			wasLaunchedSinceOpen = false,
			length = data.length,
			token = data[0],
			wpm = 0, startWpm = 0,
			timeout;
		
		
		api.isRunning = false;
		
		api.length = length;
		api.index = 0;
		
		
		api.play = function() {
			if (api.isRunning) return;
			api.isRunning = true;
			
			app.trigger(api, 'play');
			
			next(true);
			
			wasLaunchedSinceOpen = true;
		}
		
		api.pause = function() {
			clearTimeout(timeout);
			
			if (!api.isRunning) return;
			api.isRunning = false;
			
			app.trigger(api, 'pause');
		}
		
		api.toggle = function() {
			api.isRunning ? api.pause() : api.play();
		}
		
		
		api.getToken = function() {
			return data[api.index = app.norm(api.index, 0, length-1)];
		}
		
		api.getContext = function(charsLimit) {
			var token = api.getToken();
			return {
				before: raw.substring(charsLimit ? Math.max(token.startIndex-charsLimit, 0) : 0, token.startIndex).trim(),
				after: raw.substring(token.endIndex, charsLimit ? Math.min(token.endIndex+charsLimit, raw.length) : raw.length).trim()
			};
		}
		
		
		api.toNextToken = function() {
			api.index++;
			app.trigger(api, 'update');
		}
		
		api.toPrevToken = function() {
			api.index--;
			app.trigger(api, 'update');
		}
		
		api.toNextSentence = function() {
			while (++api.index < length && !data[api.index].isSentenceEnd) {}
			api.index++;
			app.trigger(api, 'update');
		}
		
		api.toPrevSentence = function() {
			api.index--;
			while (--api.index >= 0 && !data[api.index].isSentenceEnd) {}
			api.index++;
			app.trigger(api, 'update');
		}
		
		api.toLastToken = function() {
			api.index = length-1;
			app.trigger(api, 'update');
		}
		
		api.toFirstToken = function() {
			api.index = 0;
			app.trigger(api, 'update');
		}
		
		api.toTokenAtIndex = function(index) {
			api.index = length-1;
			
			for (var i = 0; i < length; i++) {
				if (data[i].endIndex >= index) {
					api.index = i;
					break;
				}
			}
			
			app.trigger(api, 'update');
		}
		
		
		api.destroy = function() {
			for (var i = 0; i < data.length; i++) {
				data[i].destroy();
				data[i] = null;
			}
			
			raw = data = null;
		}
		
	}
	
	
})(window.fastReader);
