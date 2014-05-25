
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
	
	function isTabAlive(callback) {
		getCurrentTab(function(tab) {
			chrome.tabs.sendMessage(tab.id, {type: 'isAlive'}, function(res) {
				// If tab will not respond `res` will be `undefined`
				callback(!!res, tab.id);
			});
		});
	}
	
	function installAndRun(callback) {
		isTabAlive(function(isAlive, tabId) {
			if (isAlive)
				callback(tabId);
			else
				app.isSystemTab(function(isSystem, tab) {
					if (!isSystem && tab.url) {
						install();
						setTimeout(function() {
							isTabAlive(function(res) {
								var url = tab.url.substring(0, 12);
								
								if (res) {
									callback(tabId);
									app.event('Extension', 'Runtime content script installation', url);
								}
								else {
									app.event('Error', 'Can\'t install content scripts', url);
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
			case 'onReaderStarted':
				app.sendMessageToSelectedTab({type: 'onReaderStarted'});
				callback();
				break;
		}
	}
	
	function onConnect(port) {
		if (port.name === "Popup") {
			/**
			 * Since Chrome v35 onDisconnect-event happens immediately after popup is closed.
			 * So if any other part of the system depends on isPopupOpen-message an error will be occured
			 * (e.g. View asks if pop-up is open when user clicks on the pane; since v35 this click happens only when pop-up is already disconnected).
			 */
			var TIMEOUT = 100;
			
			setTimeout(function() {
				isPopupOpen = true;
			}, TIMEOUT);
			
			port.onDisconnect.addListener(function() {
				setTimeout(function() {
					isPopupOpen = false;
				}, TIMEOUT);
			});
			
			app.sendMessageToSelectedTab({type: "onPopupOpen"});
		}
	}
	
	function onClicked(data) {
		if (data.menuItemId == 'reedyMenu') {
			app.sendMessageToSelectedTab({type: 'startReading', selectionText: data.selectionText});
			app.event('Reader', 'Open', 'Context menu');
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
		extensionId = chrome.i18n.getMessage("@@extension_id"),
		
		isDevMode = !('update_url' in manifest),
		isPopupOpen = false,
		
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
			timeLeft: false,
			sequel: false,
			
			runShortcut: {
				shiftKey: false,
				ctrlKey: false,
				altKey: true,
				keyCode: 83
			},
			
			theme: {
				light: {
					color_word: "#303030",
					color_letter: "#ff0000",
					color_context: "#8a8a8a",
					color_background: "#e6e6e6",
					font_family: null,
					font_bold: false
				},
				dark: {
					color_word: "#b8b8b8",
					color_letter: "#ff5757",
					color_context: "#8a8a8a",
					color_background: "#1f1f1f",
					font_family: null,
					font_bold: false
				}
			}
		};
	
	
	
	app.offlineUrl = chrome.runtime.getURL("offline.html");
	
	
	app.event = function(category, action, label) {
		getUUID(function(UUID) {
			if (isDevMode)
				console.log('Event: ' + [category, action, label].join(', '));
			
			ga('send', 'event', category, action, label, {
				'dimension1': UUID,
				'dimension2': version
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
			callback(key != null ? app.getByPath(items, key) : items);
		});
	}
	
	app.setSettings = function(key, value, callback) {
		app.getSettings(null, function(settings) {
			app.setByPath(settings, key, value);
			
			chrome.storage.sync.set(settings, function() {
				callback && callback();
				app.sendMessageToSelectedTab({type: "settingsUpdate", key: key, value: value});
			});
		});
	}
	
	app.setThemeSettings = function(themeName, key, value, callback) {
		app.getSettings(null, function(settings) {
			app.setByPath(settings, "theme."+themeName+"."+key, value);
			
			chrome.storage.sync.set(settings, function() {
				callback && callback();
				app.sendMessageToSelectedTab({type: "settingsUpdate", key: "theme."+themeName+"."+key, value: value});
			});
		});
	}
	
	app.resetThemeSettings = function(themeName, callback) {
		app.getSettings(null, function(settings) {
			var value = defaults.theme[themeName];
			app.setByPath(settings, "theme."+themeName, value);
			
			chrome.storage.sync.set(settings, function() {
				callback && callback();
				app.sendMessageToSelectedTab({type: "settingsUpdate", key: "theme."+themeName, value: value});
			});
		});
	}
	
	
	app.sendMessageToSelectedTab = function(data, callback) {
		installAndRun(function(tabId) {
			chrome.tabs.sendMessage(tabId, data, callback || noop);
		});
	}
	
	app.isSystemTab = function(callback) {
		getCurrentTab(function(tab) {
			callback(/^chrome|chrome\.google\.com\/webstore/.test(tab.url), tab);
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
		id: "reedyMenu",
		title: chrome.i18n.getMessage("contextMenu"),
		contexts: ["selection"]
	});
	
	chrome.contextMenus.onClicked.addListener(onClicked);
	
	
	chrome.runtime.onInstalled.addListener(onInstalled);
	
	
	
})(window.reedy);
