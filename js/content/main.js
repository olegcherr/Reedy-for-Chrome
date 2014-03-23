

(function(window) {
	
	function init(callback) {
		if (!settings) {
			settings = {};
			app.sendMessageToExtension({type: 'settingsGet'}, function(sett) {
				settings = sett;
				app.on(window, "keydown", onKeydown);
				callback();
			});
		}
		else {
			callback();
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
		settings,
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
	
	app.sendMessageToExtension = function(data, callback) {
		chrome.extension.sendMessage(data, callback);
	}
	
	
	app.on = function(elem, event, fn) {
		elem.addEventListener(event, fn);
	}
	
	app.off = function(elem, event, fn) {
		elem.removeEventListener(event, fn);
	}
	
	
	app.get = function(key) {
		return settings[key];
	}
	
	app.set = function(key, value) {
		settings[key] = value;
		app.sendMessageToExtension({type: 'settingsSet', key: key, value: value});
	}
	
	
	app.start = function() {
		init(function() {
			reader && reader.destroy();
			
			var text = window.getSelection().toString().trim();
			if (text.length > 0) {
				reader = new app.Reader(
					new app.Parser(text)
				);
			}
		});
	}
	
	
	chrome.extension.onMessage.addListener(function(msg, sender, callback) {
		switch (msg.type) {
			case 'popupSettings':
				if (settings) {
					settings[msg.key] = msg.value;
				}
				callback();
				return;
		}
	});
	
	
})(this);
