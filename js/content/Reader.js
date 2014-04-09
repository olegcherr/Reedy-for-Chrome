

(function(app) {
	
	function cleanUpTextSimple(raw) {
		var sign = '~NL'+(+(new Date())+'').slice(-5)+'NL~';
		return raw
			.trim()
			.replace(/\n|\r/gm, sign)
			.replace(/\s+/g, ' ')
			.replace(new RegExp('\\s*'+sign+'\\s*', 'g'), sign)     // `      \n    `
			.replace(new RegExp(sign, 'g'), '\n');
	}
	
	function cleanUpTextAdvanced(raw) {
		var sign = '~NL'+(+(new Date())+'').slice(-5)+'NL~';
		return raw
			.trim()
			.replace(/\n|\r/gm, sign)
			.replace(/\s+/g, ' ')
			.replace(new RegExp('\\s*'+sign+'\\s*', 'g'), sign)     // `      \n    `
			.replace(/ \- /g, ' — ')                                // replace minus with em dash
			.replace(/–|―/g, '—')                                   // there are 4 dash types. after the cleaning only 2 will remain: minus and em dash
			.replace(/[-|—]{2,}/g, '—')                             // `--` | `------`
			.replace(/\.{4,}/g, '...')                              // `.......`
			.replace(/([!?]{3})[!?]+/g, '$1')                       // `неужели!!!!!???!!?!?`
			.replace(/ ([([]+) /g, ' $1')                           // `сюжет ( видео`
			.replace(/ ([)\].!?;]+)( |$)/g, '$1$2')                 // `вставка ) отличный` | `конечно ...`
			.replace(new RegExp(sign, 'g'), '\n');
	}
	
	
	app.Reader = function(raw) {
		
		function onPopupSettings(e, key, value) {
			if (key === 'entityAnalysis')
				updateSequencer();
		}
		
		function onViewClose() {
			api.destroy();
		}
		
		function updateSequencer() {
			var tokenStartIndex = -1;
			
			if (app.get('entityAnalysis')) {
				_cache_seqSimple && (tokenStartIndex = _cache_seqSimple.getToken().startIndex);
				
				_cache_rawAdvanced = _cache_rawAdvanced || cleanUpTextAdvanced(raw);
				currentSeq = _cache_seqAdvanced = _cache_seqAdvanced || new app.Sequencer(_cache_rawAdvanced, app.advancedParser(_cache_rawAdvanced));
			}
			else {
				_cache_seqAdvanced && (tokenStartIndex = _cache_seqAdvanced.getToken().startIndex);
				
				_cache_rawSimple = _cache_rawSimple || cleanUpTextSimple(raw);
				currentSeq = _cache_seqSimple = _cache_seqSimple || new app.Sequencer(_cache_rawSimple, app.simpleParser(_cache_rawSimple));
			}
			
			view.setSequenser(currentSeq);
			
			tokenStartIndex > -1 && currentSeq.toTokenAtIndex(tokenStartIndex);
		}
		
		
		var api = this,
			isDestroyed,
			view = new app.View(),
			currentSeq,
			_cache_rawSimple, _cache_rawAdvanced,
			_cache_seqSimple, _cache_seqAdvanced;
		
		
		api.destroy = function() {
			if (isDestroyed) return;
			isDestroyed = true;
			
			app.off(app, 'popupSettings', onPopupSettings);
			app.off(view, 'close', onViewClose);
			
			view.close();
			
			_cache_seqAdvanced && _cache_seqAdvanced.destroy();
			_cache_seqSimple && _cache_seqSimple.destroy();
			
			currentSeq = _cache_seqAdvanced = _cache_seqSimple =
			_cache_rawAdvanced = _cache_rawSimple =
			view = null;
			
			app.trigger(api, 'destroy');
		}
		
		
		updateSequencer();
		
		if (app.get('autostart'))
			setTimeout(function() {
				currentSeq.play();
			}, 500);
		
		
		app.on(app, 'popupSettings', onPopupSettings);
		
		app.on(view, 'close', onViewClose);
		
	};
	
	
})(window.fastReader);
