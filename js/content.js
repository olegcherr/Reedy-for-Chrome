

(function(window, undefined) {
	
	function querySelector(selector, context) {
		return (context || document).querySelector(selector);
	}
	
	function createElement(tagName, className, $appendTo, html) {
		var $elem = document.createElement(tagName);
		className != null && ($elem.className = className);
		$appendTo && $appendTo.appendChild($elem);
		html != null && ($elem.innerHTML = html);
		return $elem;
	}
	
	function createTextNode(text) {
		return document.createTextNode(text);
	}
	
	function stopEvent(e) {
		e.preventDefault();
		e.stopImmediatePropagation();
	}
	
	
	function show(elem) {
		elem.style.display = "";
	}
	
	function hide(elem) {
		elem.style.display = "none";
	}
	
	
	function on(elem, event, fn) {
		elem.addEventListener(event, fn);
	}
	
	function off(elem, event, fn) {
		elem.removeEventListener(event, fn);
	}
	
	
	function proxy(context, fnName) {
		return function() {
			return context[fnName]();
		};
	}
	
	function cls(className) {
		for (var res = [], i = 0; i < arguments.length; i++) {
			res.push(CLS_MAIN+'-'+arguments[i]);
		}
		return res.join(' ');
	}
	
	
	function Reader(parser) {
		
		function createControl(modifiers, $appendTo, title) {
			var $btn = createElement('div', cls.apply(null, ('control_'+modifiers.join(' control_')).split(' ').concat('control')), $appendTo);
			title != null && $btn.setAttribute('title', title);
			return $btn;
		}
		
		function next() {
			clearTimeout(timeout);
			
			if (!isRunning) return;
			
			if (data = parser.next()) {
				$word.innerHTML = data.word;
				timeout = setTimeout(next, 60000/WPM);
			}
		}
		
		function onWrapperClick() {
			if (isRunning) {
				api.stop();
			}
			else {
				api.start();
			}
		}
		
		
		var api = this,
			isRunning,
			
			$wrapper            = createElement('div', cls('wrapper'), bodyElem),
			
			$envir              = createElement('div', cls('environment'), $wrapper),
			$contextBefore      = createElement('div', cls('context', 'context_before'), $envir),
			$contextAfter       = createElement('div', cls('context', 'context_after'), $envir),
			$word               = createElement('div', cls('word'), $wrapper),
			
			$panelTop           = createElement('div', cls('panel', 'panel_top'), $envir),
			
			$fontAdjust         = createElement('div', cls('adjuster', 'adjuster_font'), $panelTop, '<span>aA</span>'),
			$ctrlDecFont        = createControl(['minus'], $fontAdjust),
			$ctrlIncFont        = createControl(['plus'], $fontAdjust),
			
			$wpmAdjust          = createElement('div', cls('adjuster', 'adjuster_wpm'), $panelTop),
			$wpmText            = createElement('span', null, $wpmAdjust, '200wpm'),
			$ctrlDecWpm         = createControl(['minus'], $wpmAdjust),
			$ctrlIncWpm         = createControl(['plus'], $wpmAdjust),
			
			$panelBot           = createElement('div', cls('panel', 'panel_bottom'), $envir),
			$ctrlStart          = createControl(['start'], $panelBot),
			$ctrlNextWord       = createControl(['nextWord'], $panelBot),
			$ctrlNextSentence   = createControl(['nextSentence'], $panelBot),
			$ctrlGotoEnd        = createControl(['gotoEnd'], $panelBot),
			$ctrlPrevWord       = createControl(['prevWord'], $panelBot),
			$ctrlPrevSentence   = createControl(['prevSentence'], $panelBot),
			$ctrlGotoStart      = createControl(['gotoStart'], $panelBot),
			
			$info               = createElement('div', cls('info'), $wrapper, LNG_TAP_TO_START),
			
			bodyOverflowBefore = bodyElem.style.overflow,
			
			data, timeout;
		
		
		bodyElem.style.overflow = "hidden";
		
		
		api.start = function() {
			if (isRunning) return;
			isRunning = true;
			
			hide($info);
			hide($envir);
			
			next();
		}
		
		api.stop = function() {
			if (!isRunning) return;
			isRunning = false;
			
			show($envir);
			
			$contextBefore.innerHTML = data.before;
			$contextAfter.innerHTML = data.after;
		}
		
		api.isRunning = function() {
			return isRunning;
		}
		
		api.destroy = function() {
			bodyElem.removeChild($wrapper);
			bodyElem.style.overflow = bodyOverflowBefore;
		}
		
		
		on($wrapper, "click", onWrapperClick);
		
	}
	
	function Parser(text) {
		var api = this,
			data = text.split(/\s+/),
			wid = -1;
		
		
		api.next = function() {
			if (++wid >= data.length)
				return null;
			
			var before = data.slice(0, wid),
				after = data.slice(wid+1),
				word = data[wid];
			
			return {
				before: before.join(" "),
				after: after.join(" "),
				word: word
			};
		}
		
	}
	
	
	function onKeydown(e) {
		if (!isStarted) return;
		
		switch (e.keyCode) {
			case 27: // esc
				reader.destroy();
				reader = parser = null;
				break;
			
			case 32: // space
				reader.isRunning()
					? reader.stop()
					: reader.start();
				break;
		}
	}
	
	
	var CLS_MAIN = 'e-FastReader',
		
		LNG_TAP_TO_START = "Click the screen or press space bar to start.",
		
		WPM = 200,
		
		fastReader = window.fastReader = {},
		isStarted,
		
		bodyElem = querySelector('body'),
		
		reader, parser;
	
	
	
	fastReader.start = function() {
		isStarted && fastReader.stop();
		isStarted = true;
		
		var text = window.getSelection().toString().replace(/\r|\n/gm, "").trim();
		if (text.length > 0) {
			parser = new Parser(text);
			reader = new Reader(parser);
			
			on(window, "keydown", onKeydown);
		}
	}
	
	fastReader.stop = function() {
		isStarted = false;
		off(window, "keydown", onKeydown);
	}
	
	
	
	
	
	
	
	
	
})(window);
