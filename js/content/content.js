

(function(app) {
	
	function getSelection() {
		return window.getSelection().toString().trim();
	}
	
	function init(callback) {
		if (!settings) {
			settings = {};
			app.sendMessageToExtension({type: 'getSettings'}, function(sett) {
				settings = sett;
				callback();
			});
		}
		else {
			callback();
		}
	}
	
	
	function onReaderDestroy() {
		settings = reader = null;
		app.isReaderStarted(false);
	}
	
	function onDisconnect() {
		app.off(window, "keydown", onKeyDown);
		app.stopContentSelection();
		reader && reader.destroy();
	}
	
	function onMessage(msg, sender, callback) {
		switch (msg.type) {
			case 'popupSettings':
				settings && (settings[msg.key] = msg.value);
				app.trigger(app, 'popupSettings', [msg.key, msg.value]);
				callback();
				break;
			case 'getSelection':
				// Since the content script is being installed in all the frames on the page,
				// we shold give a priority to the one who have a text selection.
				var sel = getSelection();
				setTimeout(function() {
					// Try-catch is needed because any second call of the callback throws an exception
					try {
						callback(sel);
					}
					catch(e) { }
				}, sel ? 0 : 200);
				return true;
			case 'startReading':
				app.startReader();
				callback();
				break;
			case 'startSelector':
				app.startContentSelection();
				callback();
				break;
		}
	}
	
	function onKeyDown(e) {
		switch (e.keyCode) {
			case 83: // S
				if (e.altKey) {
					app.stopEvent(e);
					var text = getSelection();
					if (text.length) {
						app.startReader(text);
						app.event('Reader', 'Open', 'Shortcut (Alt+S)');
					}
					else {
						app.startContentSelection();
						app.event('Content selector', 'Start', 'Shortcut (Alt+S)');
					}
				}
				break;
		}
	}
	
	
	
	var port = chrome.runtime.connect({name: "Content"}), // Be careful! Port doesn't allow bg scripts to get sleep.
		settings, reader;
	
	
	app._isReaderStarted = false;
	
	app.isReaderStarted = function(val) {
		try {
			if (typeof val === 'boolean')
				window.top.fastReader._isReaderStarted = val;
			
			return window.top.fastReader._isReaderStarted;
		}
		catch(e) {
			// If an iframe is not accessible, we don't try to launch on it
			return true;
		}
	}
	
	
	app.get = function(key) {
		return settings[key];
	}
	
	app.set = function(key, value) {
		settings[key] = value;
		app.sendMessageToExtension({type: 'setSettings', key: key, value: value});
	}
	
	
	app.startReader = function(text) {
		if (app.isReaderStarted()) return;
		
		text = text != null ? text : getSelection();
		
		if (!text) {
			var frames = document.querySelectorAll('iframe,frame'), i;
			for (i = 0; i < frames.length; i++) {
				// Iframe's window might be inaccessible due to privacy policy
				try {
					frames[i].contentWindow.fastReader.startReader();
				}
				catch(e) { }
			}
			return;
		}
		
		app.isReaderStarted(true);
		
		init(function() {
			reader = new app.Reader(text);
			app.on(reader, 'destroy', onReaderDestroy);
			app.event('Text', 'Length', app.roundExp(text.length));
		});
	}
	
	app.isPopupOpen = function(callback) {
		app.sendMessageToExtension({type: "isPopupOpen"}, callback);
	}
	
	
	
	chrome.runtime.onMessage.addListener(onMessage);
	port.onDisconnect.addListener(onDisconnect);
	
	app.on(window, "keydown", onKeyDown);
	
	
})(window.fastReader);
