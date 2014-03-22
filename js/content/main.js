

(function(window) {
	
	function onKeydown(e) {
		if (!isStarted) return;
		
		switch (e.keyCode) {
			case 27: // esc
				app.stopEvent(e);
				reader.destroy();
				reader = parser = null;
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
		isStarted,
		
		reader, parser;
	
	
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
		isStarted && app.stop();
		isStarted = true;
		
		var text = window.getSelection().toString().trim();
		if (text.length > 0) {
			parser = new app.Parser(text);
			reader = new app.Reader(parser);
			
			app.on(window, "keydown", onKeydown);
		}
	}
	
	app.stop = function() {
		isStarted = false;
		app.off(window, "keydown", onKeydown);
	}
	
	
})(this);
