

(function() {
	
	var app = window.fastReaderPopup = {};
	
	
	app.each = function(arr, fn) {
		for (var i = 0; i < arr.length && fn(arr[i]) !== false; i++) {}
	}
	
	app.on = function(elem, event, fn) {
		elem.addEventListener(event, fn);
	}
	
	app.off = function(elem, event, fn) {
		elem.removeEventListener(event, fn);
	}
	
	
	app.sendMessageToExtension = function(data, callback) {
		chrome.extension.sendMessage(data, callback);
	}
	
	app.sendMessageToSelectedTab = function(data, callback) {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendMessage(tab.id, data, callback);
		});
	}
	
	
	app.settingsSet = function(key, value, callback) {
		app.sendMessageToExtension({type: 'settingsSet', key: key, value: value}, callback);
		app.sendMessageToExtension({type: 'popupSettings', key: key, value: value});
	}
	
	
})();
