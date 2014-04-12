

(function() {
	
	var app = window.fastReader = {},
		toString = Object.prototype.toString;
	
	
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
		chrome.extension.sendMessage(data, callback || function() {});
	}
	
	app.event = function(category, action, label) {
		app.sendMessageToExtension({type: 'trackEvent', category: category, action: action, label: label});
	}
	
	app.t = function() {
		return chrome.i18n.getMessage.apply(chrome.i18n, arguments);
	}
	
	
})();
