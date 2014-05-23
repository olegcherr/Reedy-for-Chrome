

(function() {
	
	var app = window.reedy = {},
		toString = Object.prototype.toString,
		
		/**
		 * Javascript: The Definitive Guide
		 * https://www.inkling.com/read/javascript-definitive-guide-david-flanagan-6th/chapter-17/a-keymap-class-for-keyboard
		 */
		keyCodeToKeyName = {
			8: "Backspace", 9: "Tab", 13: "Enter",
			19: "Pause", 27: "Esc", 32: "Spacebar", 33: "PageUp",
			34: "PageDown", 35: "End", 36: "Home", 37: "Left", 38: "Up", 39: "Right",
			40: "Down", 45: "Insert", 46: "Del",
			
			48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9",
			
			65: "A", 66: "B", 67: "C", 68: "D", 69: "E", 70: "F", 71: "G", 72: "H", 73: "I",
			74: "J", 75: "K", 76: "L", 77: "M", 78: "N", 79: "O", 80: "P", 81: "Q", 82: "R",
			83: "S", 84: "T", 85: "U", 86: "V", 87: "W", 88: "X", 89: "Y", 90: "Z",
			
			96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7", 104: "8", 105: "9",
			106: "Multiply", 107: "Add", 109: "Subtract", 110: "Decimal", 111: "Divide",
			
			112: "F1", 113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6",
			118: "F7", 119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12",
			124: "F13", 125: "F14", 126: "F15", 127: "F16", 128: "F17", 129: "F18",
			130: "F19", 131: "F20", 132: "F21", 133: "F22", 134: "F23", 135: "F24",
			
			186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\", 221: "]", 222: "'"
		};
	
	
	app.offlinePageUrl = chrome.runtime.getURL("offline.html");
	
	
	app.proxy = function(context, fnName) {
		return function() {
			return context[fnName]();
		};
	}
	
	
	app.norm = function(num, min, max) {
		return num > max
			? max
			: num < min ? min : num;
	}
	
	app.roundExp = function(num) {
		var pow = Math.pow(10, (num+'').length-1);
		return Math.round(num/pow) * pow;
	}
	
	app.htmlEncode = function(str) {
		return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}
	
	app.zeroPad = function(num, len) {
		return (num = num+'').length < len
			? (new Array(len).join('0') + num).slice(-len)
			: num;
	}
	
	app.each = function(arr, fn) {
		for (var i = 0; i < arr.length && fn(arr[i]) !== false; i++) {}
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
	
	app.getByPath = function(object, path) {
		var index;
		
		while ((index = path.indexOf('.')) > -1) {
			object = object[path.substring(0, index)];
			path = path.substring(index+1);
		}
		
		return object[path];
	}
	
	app.setByPath = function(object, path, value) {
		var obj = object,
			temp, index, p;
		
		while ((index = path.indexOf('.')) > -1) {
			p = path.substring(0, index);
			
			temp = obj[p];
			if (typeof temp !== "object")
				temp = obj[p] = {};
			
			obj = temp;
			
			path = path.substring(index+1);
		}
		
		obj[path] = value;
		
		return object;
	}
	
	
	app.stopEvent = function(e) {
		e.preventDefault();
		e.stopImmediatePropagation();
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
	
	
	app.sendMessageToExtension = function(data, callback) {
		chrome.runtime.sendMessage(data, callback || function() {});
	}
	
	app.event = function(category, action, label) {
		app.sendMessageToExtension({type: 'trackEvent', category: category, action: action, label: label});
	}
	
	app.t = function() {
		return chrome.i18n.getMessage.apply(chrome.i18n, arguments);
	}
	
	app.localizeElements = function(document) {
		app.each(document.querySelectorAll('[i18n]'), function($elem) {
			$elem.innerHTML = app.t($elem.getAttribute('i18n'));
			$elem.removeAttribute('i18n');
		});
		app.each(document.querySelectorAll('[i18n-attr]'), function($elem) {
			var m = $elem.getAttribute('i18n-attr').split('|');
			$elem.setAttribute(m[0], app.t(m[1]));
			$elem.removeAttribute('i18n-attr');
		});
	}
	
	
	app.shortcutDataToString = function(data, addSpaces) {
		var res = [];
		data.shiftKey && res.push('Shift');
		data.ctrlKey && res.push('Ctrl');
		data.altKey && res.push('Alt');
		data.keyCode && res.push(keyCodeToKeyName[data.keyCode]);
		return res.join(addSpaces ? ' + ' : '+');
	}
	
	app.eventToShortcutData = function(e) {
		return {
			shiftKey: e.shiftKey,
			ctrlKey: e.ctrlKey,
			altKey: e.altKey,
			keyCode: keyCodeToKeyName[e.keyCode] ? e.keyCode : null
		};
	}
	
	app.checkEventForShortcut = function(e, data) {
		return e.shiftKey === data.shiftKey
			&& e.ctrlKey === data.ctrlKey
			&& e.altKey === data.altKey
			&& keyCodeToKeyName[e.keyCode]
			&& e.keyCode === data.keyCode;
	}
	
	app.checkShortcut = function(data) {
		return (data.ctrlKey || data.altKey) && !!keyCodeToKeyName[data.keyCode];
	}
	
	
	
})();
