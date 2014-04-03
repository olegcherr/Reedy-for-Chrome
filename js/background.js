

(function() {
	
	function generateUUID() {
		var d = new Date().getTime(),
			uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = (d + Math.random()*16)%16 | 0;
				d = Math.floor(d/16);
				return (c === 'x' ? r : (r&0x7|0x8)).toString(16);
			});
		return parseInt(uuid, 16).toString(36);
	}
	
	function getUUID(callback) {
		if (UUID)
			callback(UUID);
		else
			chrome.storage.sync.get({UUID: 0}, function(items) {
				UUID = items.UUID;
				if (!UUID) {
					UUID = generateUUID();
					chrome.storage.sync.set({UUID: UUID});
				}
				callback(UUID);
			});
	}
	
	
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
	
	
	function trackEvent(category, action, label) {
		getUUID(function(UUID) {
			if (isDevMode)
				console.log('Event: ' + [category, action, label].join(', '));
			
			ga('send', 'event', category, action, label, {
				'dimension1': UUID
			});
		});
	}
	
	function trackJSError(e, context) {
		var msg = e.message,
			filename = e.filename;
		if (filename) {
			filename = filename.replace(new RegExp('^.+'+extensionId+'/'), '');
			msg += ' ('+filename+' -> '+e.lineno+':'+e.colno+')';
		}
		trackEvent('Error', context, msg);
	}
	
	
	
	window.addEventListener('error', function(e) {
		trackJSError(e, 'JS Background');
	});
	
	var isDevMode = !('update_url' in chrome.runtime.getManifest()),
		isPopupOpen = false,
		extensionId = chrome.i18n.getMessage("@@extension_id"),
		UUID,
		defaults = {
			fontSize: 4, // 1-7
			wpm: 300,
			autostart: false,
			darkTheme: false,
			transparentBg: false,
			vPosition: 4,
			focusMode: true,
			smartSlowing: true,
			entityAnalysis: true,
			emptySentenceEnd: true,
			hyphenation: true
		};
	
	
	getUUID(function(UUID) {
		ga('create', isDevMode ? 'UA-5025776-14' : 'UA-5025776-15', {
			'storage': 'none',
			'clientId': UUID
		});
		
		/**
		 * Fix
		 * Read more: https://code.google.com/p/analytics-issues/issues/detail?id=312
		 */
		ga('set', 'checkProtocolTask', function() {});
	});
	
	
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
			case 'trackEvent':
				trackEvent(msg.category, msg.action, msg.label);
				callback();
				break;
			case 'trackJSError':
				trackJSError(msg, msg.context);
				callback();
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
			trackEvent('Reader', 'Open', 'Context menu');
		}
	});
	
	
	chrome.runtime.onInstalled.addListener(function(details) {
		if (details.reason === "install") {
			chrome.tabs.query({}, function(tabs) {
				for (var i = 0, tid; i < tabs.length; i++) {
					tid = tabs[i].id;
					chrome.tabs.executeScript(tid, {file: 'js/content/main.js'});
					chrome.tabs.executeScript(tid, {file: 'js/content/Parser.js'});
					chrome.tabs.executeScript(tid, {file: 'js/content/Reader.js'});
				}
			});
			
			// Let the UUID to be generated
			setTimeout(function() {
				trackEvent('Extension', 'Installed');
			}, 500);
		}
	});
	
	
	
})();
