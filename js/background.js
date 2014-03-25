

(function() {
	
	function settingsGet(key, callback) {
		chrome.storage.sync.get(defaults, function(items) {
			callback(key != null ? items[key] : items);
		});
	}
	
	function settingsSet(key, value, callback) {
		var settings = {};
		settings[key] = value;
		chrome.storage.sync.set(settings, callback);
	}
	
	
	var defaults = {
			fontSize: 4, // 1-7
			wpm: 200,
			autostart: false,
			darkTheme: false,
			transparentBg: false,
			vPosition: 4,
			focusMode: true,
			smartSlowing: true,
			entityAnalysis: true
		},
		
		isPopupOpen = false;
	
	
	chrome.extension.onMessage.addListener(function(msg, sender, callback) {
		switch (msg.type) {
			case 'settingsGet':
				settingsGet(msg.key, callback);
				return true;
			case 'settingsSet':
				settingsSet(msg.key, msg.value, callback);
				break;
			case 'isPopupOpen':
				callback(isPopupOpen);
				break;
		}
	});
	
	
	chrome.extension.onConnect.addListener(function(port) {
		if (port.name === "Popup") {
			isPopupOpen = true;
			port.onDisconnect.addListener(function() {
				isPopupOpen = false;
			});
		}
	});
	
	
	chrome.contextMenus.create({
		id: "fastReaderMenu",
		title: chrome.i18n.getMessage("contextMenu"),
		contexts: ["selection"]
	});
	
	chrome.contextMenus.onClicked.addListener(function (data) {
		if (data.menuItemId == 'fastReaderMenu') {
			chrome.tabs.executeScript(null, {
				code: 'window.fastReader && window.fastReader.start();'
			});
		}
	});
	
	
	
})();
