
/**
 * Notes
 * - Manifest's permission `tabs` is needed to get access
 * to the `url`, `title`, and `favIconUrl` properties of a tab,
 * that is not active at the moment.
 */

(function(app) {
	
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
	
	
	function install(tabId) {
		var contentScripts = manifest.content_scripts['0'].js, i;
		for (i = 0; i < contentScripts.length; i++) {
			chrome.tabs.executeScript(tabId == null ? null : tabId, {file: contentScripts[i]});
		}
	}
	
	function isInstalled(callback) {
		chrome.tabs.executeScript(null, {code: '!!window.fastReader;'}, function(res) {
			callback(res && res[0]);
		});
	}
	
	function installAndRun(callback) {
		isInstalled(function(res) {
			if (res)
				callback();
			else
				getCurrentTab(function(tab) {
					if (!/^chrome|chrome\.google\.com\/webstore/.test(tab.url)) {
						install();
						setTimeout(function() {
							isInstalled(function(res) {
								if (res) {
									callback();
									app.event('Extension', 'Runtime content script installation');
								}
								else {
									app.event('Error', 'Can\'n install content scripts', tab.url.substring(0, 12));
								}
							});
						}, 200);
					}
				});
		});
	}
	
	
	function getCurrentTab(callback) {
		chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
			tabs[0] && callback(tabs[0]);
		});
	}
	
	
	function onMessage(msg, sender, callback) {
		switch (msg.type) {
			case 'getSettings':
				app.getSettings(msg.key, callback);
				return true;
			case 'setSettings':
				app.setSettings(msg.key, msg.value, callback);
				return true;
			case 'isPopupOpen':
				callback(isPopupOpen);
				break;
			case 'trackEvent':
				app.event(msg.category, msg.action, msg.label);
				callback();
				break;
			case 'trackJSError':
				app.trackJSError(msg, msg.context);
				callback();
				break;
		}
	}
	
	function onConnect(port) {
		if (port.name === "Popup") {
			isPopupOpen = true;
			port.onDisconnect.addListener(function() {
				isPopupOpen = false;
			});
		}
	}
	
	function onClicked(data) {
		if (data.menuItemId == 'fastReaderMenu') {
			installAndRun(function() {
				chrome.tabs.executeScript(null, {code: 'window.fastReader && window.fastReader.startReader(null, ' + JSON.stringify(data.selectionText) + ');'});
				app.event('Reader', 'Open', 'Context menu');
			});
		}
	}
	
	function onInstalled(details) {
		if (details.reason === "install") {
			// Let the UUID to be generated
			setTimeout(function() {
				chrome.tabs.query({}, function(tabs) {
					for (var i = 0; i < tabs.length; i++) {
						install(tabs[i].id);
					}
				});
				
				app.event('Extension', 'Installed', version);
			}, 500);
		}
	}
	
	
	
	window.addEventListener('error', function(e) {
		app.trackJSError(e, 'JS Background');
	});
	
	var manifest = chrome.runtime.getManifest(),
		version = manifest.version,
		isDevMode = !('update_url' in manifest),
		isPopupOpen = false,
		extensionId = chrome.i18n.getMessage("@@extension_id"),
		noop = function() {},
		UUID,
		defaults = {
			wpm: 300,
			fontSize: 3, // 1-7
			vPosition: 4, // 1-5
			darkTheme: false,
			transparentBg: false,
			
			autostart: false,
			focusMode: true,
			gradualAccel: true,
			smartSlowing: true,
			
			entityAnalysis: true,
			hyphenation: true,
			emptySentenceEnd: true,
			
			progressBar: true,
			timeLeft: false
		};
	
	
	
	app.event = function(category, action, label) {
		getUUID(function(UUID) {
			if (isDevMode)
				console.log('Event: ' + [category, action, label].join(', '));
			
			ga('send', 'event', category, action, label, {
				'dimension1': UUID
			});
		});
	}
	
	app.trackJSError = function(e, context) {
		var msg = e.message,
			filename = e.filename;
		if (filename) {
			filename = filename.replace(new RegExp('^.+'+extensionId+'/'), '');
			msg += ' ('+filename+' -> '+e.lineno+':'+e.colno+')';
		}
		app.event('Error', context, msg);
	}
	
	
	app.getSettings = function(key, callback) {
		chrome.storage.sync.get(defaults, function(items) {
			callback(key != null ? items[key] : items);
		});
	}
	
	app.setSettings = function(key, value, callback) {
		var settings = {};
		settings[key] = value;
		chrome.storage.sync.set(settings, callback || noop);
		
		app.sendMessageToSelectedTab({type: 'popupSettings', key: key, value: value});
	}
	
	
	app.sendMessageToSelectedTab = function(data, callback) {
		installAndRun(function() {
			getCurrentTab(function(tab) {
				chrome.tabs.sendMessage(tab.id, data, callback || noop);
			});
		});
	}
	
	
	
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
		
		
		var lastVersion = localStorage['version'];
		if (lastVersion && lastVersion !== version)
			app.event('Extension', 'Updated', 'To '+version+' from '+lastVersion);
		
		localStorage['version'] = version;
	});
	
	
	chrome.runtime.onMessage.addListener(onMessage);
	
	chrome.runtime.onConnect.addListener(onConnect);
	
	
	chrome.contextMenus.create({
		id: "fastReaderMenu",
		title: chrome.i18n.getMessage("contextMenu"),
		contexts: ["selection"]
	});
	
	chrome.contextMenus.onClicked.addListener(onClicked);
	
	
	chrome.runtime.onInstalled.addListener(onInstalled);
	
	
	
})(window.fastReader);
