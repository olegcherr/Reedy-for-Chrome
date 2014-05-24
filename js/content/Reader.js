

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
		var NL = '~NL'+(+(new Date())+'').slice(-5)+'NL~';
		return raw
			.trim()
			.replace(/\n|\r/gm, NL)
			.replace(/\s+/g, ' ')
			.replace(new RegExp('\\s*'+NL+'\\s*', 'g'), NL)                     // `      \n    `
			.replace(/‐/g, '-')                                                 // short dash will be replaced with minus
			.replace(/ \- /g, ' — ')                                            // replace minus between words with em dash
			.replace(/–|−|―/g, '—')                                             // there are 5 dash types. after the cleaning only 2 will remain: minus and em dash
			.replace(/[-|—]{2,}/g, '—')                                         // `--` | `------`
			.replace(new RegExp('( |^|'+NL+')([([«]+) ', 'g'), '$1$2')          // `сюжет ( видео`
			.replace(new RegExp(' ([)\\].,!?;»]+)( |$|'+NL+')', 'g'), '$1$2')   // `вставка ) отличный` | `конечно ...` | ` , ` | ` .\n`
			.replace(/\.{4,}/g, '...')                                          // `.......`
			.replace(/([!?]{3})[!?]+/g, '$1')                                   // `неужели!!!!!???!!?!?`
			.replace(new RegExp(NL, 'g'), '\n');
	}
	
	
	app.Reader = function(raw) {
		
		function onSettingsUpdate(e, key, value) {
			if (key === 'entityAnalysis')
				updateSequencer();
		}
		
		function onPopupOpen() {
			currentSeq.pause();
		}
		
		function onViewClose() {
			api.destroy();
		}
		
		function onSequencerUpdate() {
			if (!isConfigSent && currentSeq.index === Math.round(currentSeq.length / 3 * 2)) {
				isConfigSent = true;
				
				var darkTheme = app.get("darkTheme"),
					themeName = darkTheme ? "dark" : "light",
					theme = app.get("theme."+themeName);
				
				app.event('Config', 'WPM',                  app.get('wpm'));
				app.event('Config', 'Font size',            app.get('fontSize'));
				app.event('Config', 'Vertical position',    app.get('vPosition'));
				app.event('Config', 'Dark theme',           darkTheme);
				app.event('Config', 'Transparent bg',       app.get('transparentBg'));
				
				app.event('Config', 'Autostart',            app.get('autostart'));
				app.event('Config', 'Focus mode',           app.get('focusMode'));
				app.event('Config', 'Gradual acceleration', app.get('gradualAccel'));
				app.event('Config', 'Smart slowing',        app.get('smartSlowing'));
				
				app.event('Config', 'Entity analysis',      app.get('entityAnalysis'));
				app.event('Config', 'Hyphenation',          app.get('hyphenation'));
				app.event('Config', 'Empty sentence end',   app.get('emptySentenceEnd'));
				
				app.event('Config', 'Progress bar',         app.get('progressBar'));
				app.event('Config', 'Time left',            app.get('timeLeft'));
				app.event('Config', 'Sequel',               app.get('sequel'));
				
				app.event('Config', 'Run shortcut',         app.shortcutDataToString(app.get('runShortcut')));
				
				app.event('Config', 'Font', [
					theme.font_family || "-default-",
					theme.font_bold ? "bold" : "normal"
				].join(", ")+" ("+themeName+")");
				
				app.event('Config', 'Colors', [
					themeName+":",
					theme.color_letter,
					theme.color_word,
					theme.color_context,
					theme.color_background
				].join(" "));
			}
		}
		
		function updateSequencer() {
			var tokenStartIndex = -1;
			
			currentSeq && currentSeq.pause();
			
			if (app.get('entityAnalysis')) {
				_cache_seqSimple && (tokenStartIndex = _cache_seqSimple.getToken().startIndex);
				
				currentText = _cache_textAdvanced = _cache_textAdvanced || cleanUpTextAdvanced(raw);
				currentSeq = _cache_seqAdvanced = _cache_seqAdvanced || new app.Sequencer(_cache_textAdvanced, app.advancedParser(_cache_textAdvanced));
			}
			else {
				_cache_seqAdvanced && (tokenStartIndex = _cache_seqAdvanced.getToken().startIndex);
				
				currentText = _cache_textSimple = _cache_textSimple || cleanUpTextSimple(raw);
				currentSeq = _cache_seqSimple = _cache_seqSimple || new app.Sequencer(_cache_textSimple, app.simpleParser(_cache_textSimple));
			}
			
			view.setSequencer(currentSeq);
			
			tokenStartIndex > -1 && currentSeq.toTokenAtIndex(tokenStartIndex);
			
			app.off(currentSeq, 'update', onSequencerUpdate);
			if (currentText.length > 3000 && currentSeq.length > 400)
				app.on(currentSeq, 'update', onSequencerUpdate);
		}
		
		
		var api = this,
			isDestroyed, isConfigSent,
			view = new app.View(),
			currentSeq, currentText,
			_cache_textSimple, _cache_textAdvanced,
			_cache_seqSimple, _cache_seqAdvanced;
		
		
		api.destroy = function() {
			if (isDestroyed) return;
			isDestroyed = true;
			
			app.off(app, 'settingsUpdate', onSettingsUpdate);
			app.off(app, "onPopupOpen", onPopupOpen);
			app.off(view, 'close', onViewClose);
			
			view.close();
			
			_cache_seqAdvanced && _cache_seqAdvanced.destroy();
			_cache_seqSimple && _cache_seqSimple.destroy();
			
			currentSeq = currentText =
			_cache_seqAdvanced = _cache_seqSimple =
			_cache_textAdvanced = _cache_textSimple =
			view = null;
			
			app.trigger(api, 'destroy');
		}
		
		
		updateSequencer();
		
		if (app.get('autostart'))
			setTimeout(function() {
				currentSeq.play();
			}, 500);
		
		
		app.on(app, "settingsUpdate", onSettingsUpdate);
		app.on(app, "onPopupOpen", onPopupOpen);
		
		app.on(view, 'close', onViewClose);
		
	};
	
	
})(window.reedy);
