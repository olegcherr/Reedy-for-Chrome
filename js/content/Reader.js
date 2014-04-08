

(function(app) {
	
	
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
				currentSeq = _cache_seqAdvanced = _cache_seqAdvanced || new app.Sequencer(raw, app.advancedParser(raw));
			}
			else {
				_cache_seqAdvanced && (tokenStartIndex = _cache_seqAdvanced.getToken().startIndex);
				currentSeq = _cache_seqSimple = _cache_seqSimple || new app.Sequencer(raw, app.simpleParser(raw));
			}
			
			view.setSequenser(currentSeq);
			
			tokenStartIndex > -1 && currentSeq.toTokenAtIndex(tokenStartIndex);
		}
		
		
		var api = this,
			isDestroyed,
			view = new app.View(),
			currentSeq,
			_cache_seqSimple, _cache_seqAdvanced;
		
		
		api.destroy = function() {
			if (isDestroyed) return;
			isDestroyed = true;
			
			view.close();
			
			_cache_seqAdvanced && _cache_seqAdvanced.destroy();
			_cache_seqSimple && _cache_seqSimple.destroy();
			
			currentSeq = _cache_seqAdvanced = _cache_seqSimple =
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
