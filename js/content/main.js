

(function() {
	
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
	
	
	
	var app = window.fastReader = {},
		port = chrome.extension.connect({name: "Content"}),
		toString = Object.prototype.toString,
		settings, reader;
	
	
	app.isReaderStarted = false;
	
	
	app.stopEvent = function(e) {
		e.preventDefault();
		e.stopImmediatePropagation();
	}
	
	app.proxy = function(context, fnName) {
		return function() {
			return context[fnName]();
		};
	}
	
	app.zeroPad = function(num, len) {
		return (num = num+'').length < len
			? (new Array(len).join('0') + num).slice(-len)
			: num;
	}
	
	app.flatten = function(array) {
		var res = [];
		
		(function flat(arr) {
			if (toString.call(arr) === '[object Array]')
				arr.forEach(flat);
			else
				res.push(arr);
		})(array);
		
		return res;
	}
	
	app.roundExp = function(num) {
		var pow = Math.pow(10, (num+'').length-1);
		return Math.round(num/pow) * pow;
	}
	
	app.offset = function($elem) {
		var rect = $elem.getBoundingClientRect(),
			$docElem = $elem.ownerDocument && $elem.ownerDocument.documentElement || {};
		return {
			top: rect.top + window.pageYOffset - $docElem.clientTop,
			left: rect.left + window.pageXOffset - $docElem.clientLeft,
			width: rect.width,
			height: rect.height
		};
	}
	
	app.createElement = function(tagName, className, $appendTo, html, title) {
		var $elem = document.createElement(tagName);
		className != null && ($elem.className = className);
		$appendTo && $appendTo.appendChild($elem);
		html != null && ($elem.innerHTML = html);
		title != null && ($elem.title = title);
		return $elem;
	}
	
	app.parents = function($elem) {
		var res = [];
		while ($elem = $elem.parentNode) {
			res.push($elem);
		}
		return res;
	}
	
	app.norm = function(num, min, max) {
		return num > max
			? max
			: num < min ? min : num;
	}
	
	app.htmlEncode = function(str) {
		return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	
	
	app.on = function(elem, event, fn) {
		if (elem.nodeName || elem === window)
			elem.addEventListener(event, fn);
		else {
			var events = elem.__events__ = elem.__events__ || {};
			events[event] = events[event] || [];
			events[event].push(fn);
		}
	}
	
	app.off = function(elem, event, fn) {
		if (elem.nodeName || elem === window)
			elem.removeEventListener(event, fn);
		else {
			var callbacks = elem.__events__ && elem.__events__[event],
				cb, i = -1;
			if (callbacks) {
				while (cb = callbacks[++i]) {
					if (cb === fn) {
						callbacks.splice(i,1);
						i--;
					}
				}
			}
		}
	}
	
	app.trigger = function(elem, event, args) {
		var callbacks = elem.__events__ && elem.__events__[event], i;
		if (callbacks) {
			for (i = 0; i < callbacks.length; i++) {
				callbacks[i].apply(elem, [{type: event}].concat(args || []));
			}
		}
	}
	
	
	app.get = function(key) {
		return settings[key];
	}
	
	app.set = function(key, value) {
		settings[key] = value;
		app.sendMessageToExtension({type: 'setSettings', key: key, value: value});
	}
	
	
	app.sendMessageToExtension = function(data, callback) {
		chrome.extension.sendMessage(data, callback || function() {});
	}
	
	app.isPopupOpen = function(callback) {
		app.sendMessageToExtension({type: "isPopupOpen"}, callback);
	}
	
	app.event = function(category, action, label) {
		app.sendMessageToExtension({type: 'trackEvent', category: category, action: action, label: label});
	}
	
	app.t = function() {
		return chrome.i18n.getMessage.apply(chrome.i18n, arguments);
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
	
	
	
	chrome.extension.onMessage.addListener(onMessage);
	port.onDisconnect.addListener(onDisconnect);
	
	app.on(window, "keydown", onKeyDown);
	
	
})();
