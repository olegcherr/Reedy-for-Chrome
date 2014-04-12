

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
		app.isReaderStarted = false;
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
				callback(getSelection());
				break;
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
	
	
	
	var port = chrome.extension.connect({name: "Content"}), // Be careful! Port doesn't allow bg scripts to get sleep.
		settings, reader;
	
	
	app.isReaderStarted = false;
	
	
	app.get = function(key) {
		return settings[key];
	}
	
	app.set = function(key, value) {
		settings[key] = value;
		app.sendMessageToExtension({type: 'setSettings', key: key, value: value});
	}
	
	
	app.startReader = function(text) {
		text = text != null ? text : getSelection();
		
		if (!text.length || app.isReaderStarted) return;
		app.isReaderStarted = true;
		
		init(function() {
			reader = new app.Reader(text);
			app.on(reader, 'destroy', onReaderDestroy);
			app.event('Text', 'Length', app.roundExp(text.length));
		});
	}
	
	app.isPopupOpen = function(callback) {
		app.sendMessageToExtension({type: "isPopupOpen"}, callback);
	}
	
	
	
	chrome.extension.onMessage.addListener(onMessage);
	port.onDisconnect.addListener(onDisconnect);
	
	app.on(window, "keydown", onKeyDown);
	
	
})(window.fastReader);
