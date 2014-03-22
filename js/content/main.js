

(function(window) {
	
	function init() {
		if (!isInited) {
			isInited = true;
			
			defaults = {
				fontSize: 4, // 1-7
				wpm: 200
			};
			
			app.on(window, "keydown", onKeydown);
		}
	}
	
	function onKeydown(e) {
		if (!reader) return;
		
		switch (e.keyCode) {
			case 27: // esc
				app.stopEvent(e);
				reader.destroy();
				reader = null;
				break;
			
			case 32: // space
				app.stopEvent(e);
				reader.isRunning()
					? reader.stop()
					: reader.start();
				break;
		}
	}
	
	
	
	var app = window.fastReader = {},
		defaults, settings,
		isInited,
		reader;
	
	
	app.stopEvent = function(e) {
		e.preventDefault();
		e.stopImmediatePropagation();
	}
	
	app.proxy = function(context, fnName) {
		return function() {
			return context[fnName]();
		};
	}
	
	
	app.on = function(elem, event, fn) {
		elem.addEventListener(event, fn);
	}
	
	app.off = function(elem, event, fn) {
		elem.removeEventListener(event, fn);
	}
	
	
	app.start = function() {
		init();
		
		chrome.storage.sync.get(defaults, function(items) {
			settings = items;
			
			reader && reader.destroy();
			
			var text = window.getSelection().toString().trim();
			if (text.length > 0) {
				reader = new app.Reader(
					new app.Parser(text)
				);
			}
		});
	}
	
	
	app.get = function(key) {
		return settings[key];
	}
	
	app.set = function(key, value) {
		settings[key] = value;
		chrome.storage.sync.set(settings);
	}
	
	
})(this);
