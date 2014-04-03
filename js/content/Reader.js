

(function(app) {
	
	function querySelector(selector, $context) {
		return ($context || document).querySelector(selector);
	}
	
	function createElement(tagName, className, $appendTo, html, title) {
		var $elem = document.createElement(tagName);
		className != null && ($elem.className = className);
		$appendTo && $appendTo.appendChild($elem);
		html != null && ($elem.innerHTML = html);
		title != null && ($elem.title = title);
		return $elem;
	}
	
	function createControl(modifiers, $appendTo, title) {
		var $btn = createElement('div', cls.apply(null, ('control_'+modifiers.join(' control_')).split(' ').concat('control')), $appendTo);
		title != null && $btn.setAttribute('title', title);
		return $btn;
	}
	
	
	function dBlock($elem) {
		$elem.style.display = "block";
	}
	
	function dNone($elem) {
		$elem.style.display = "none";
	}
	
	function cls() {
		for (var res = [], i = 0; i < arguments.length; i++) {
			res.push(CLS_MAIN+'-'+arguments[i]);
		}
		return res.join(' ');
	}
	
	
	
	var CLS_MAIN = 'e-FastReader',
		
		CONTEXT_CHARS_LIMIT = 2000,
		
		MIN_WPM     = 50,
		MAX_WPM     = 2000,
		WPM_STEP    = 50,
		
		MIN_FONT    = 1,
		MAX_FONT    = 7,
		
		$body = querySelector('body');
	
	
	app.Reader = function(parser) {
		
		function next(justRun) {
			clearTimeout(timeout);
			
			if (!isRunning) return;
			
			if (parser.isLastWord()) {
				setTimeout(function() {
					api.stop();
				}, 500);
			}
			else {
				token = justRun && token || parser.nextWord();
				
				// This is a good place for this check.
				// If there are less that 3 words in the text, the check will be never passed.
				if (parser.isPenultWord()) {
					app.event('Config', 'WPM',              app.get('wpm'));
					app.event('Config', 'Font size',        app.get('fontSize'));
					app.event('Config', 'Autostart',        app.get('autostart'));
					app.event('Config', 'Dark theme',       app.get('darkTheme'));
					app.event('Config', 'Transparent bg',   app.get('transparentBg'));
					app.event('Config', 'Ver. position',    app.get('vPosition'));
					app.event('Config', 'Focus mode',       app.get('focusMode'));
					app.event('Config', 'Smart slowing',    app.get('smartSlowing'));
					app.event('Config', 'Entity analysis',  app.get('entityAnalysis'));
//					app.event('Config', 'Empty sent. end',  app.get('emptySentenceEnd'));
					app.event('Config', 'Hyphenation',      app.get('hyphenation'));
				}
				
				function doUpdate() {
					var hyphenated = app.get('hyphenation') ? token.toHyphenated() : [token.toString()],
						i = -1;
					
					(function go() {
						if (hyphenated[++i]) {
							updateWord(hyphenated[i]+(i < hyphenated.length-1 ? '-' : ''));
							
							timeout = setTimeout(
								go,
								(60000/app.get('wpm')) * (wasRun
									? app.get('smartSlowing') && parser.isDelayed() ? 2 : 1
									: 2)
							);
						}
						else {
							next();
						}
					})();
				}
				
				if (!justRun && app.get('emptySentenceEnd') && parser.isSentenceStart() && !parser.isFirstWord()) {
					updateWord(true);
					timeout = setTimeout(doUpdate, 60000/app.get('wpm')*2);
				}
				else {
					doUpdate();
				}
				
				wasRun = true;
			}
		}
		
		
		function updateWrapper() {
			$wrapper.setAttribute('is-running', isRunning);
			$wrapper.setAttribute('dark-theme', app.get('darkTheme'));
			$wrapper.setAttribute('transparent-bg', app.get('transparentBg'));
			$wrapper.setAttribute('font-size', app.get('fontSize'));
			$wrapper.setAttribute('focus-mode', app.get('focusMode'));
			$wrapper.setAttribute('v-position', app.get('vPosition'));
		}
		
		function updatePanels() {
			$wpmText.innerHTML = app.get('wpm')+'wpm';
		}
		
		function updateContext() {
			if (token) {
				var context = parser.getContext(CONTEXT_CHARS_LIMIT);
				$contextBefore.innerHTML = context.before.replace(/\n/g, "<br/>");
				$contextAfter.innerHTML = context.after.replace(/\n/g, "<br/>");
			}
		}
		
		function updateWord(str) {
			if (str === true) {
				$word.innerHTML = '';
				return;
			}
			
			str = str || token.toString();
			
			$word.style.left = '';
			
			if (app.get('focusMode')) {
				var pivot = app.calcPivotPoint(str);
				$word.innerHTML = str.substr(0, pivot)+'<span>'+str[pivot]+'</span>'+str.substr(pivot+1);
				
				var letterRect = $word.querySelector('span').getBoundingClientRect();
				$word.style.left = Math.round(focusPoint - letterRect.left - letterRect.width/2)+'px';
			}
			else {
				$word.innerHTML = str;
			}
		}
		
		function updateFocusPoint() {
			var rect = $focusDashes.getBoundingClientRect();
			focusPoint = Math.floor(rect.left + Math.floor(rect.width)/2);
		}
		
		
		function onPaneClick() {
			var selection = window.getSelection(),
				$node = selection.anchorNode;
			
			if (selection.toString().length && $node) {
				while (($node = $node.parentNode) && $node !== $pane) {}
				if ($node === $pane) {
					return;
				}
			}
			
			app.isPopupOpen(function(res) {
				res || onStartCtrl();
			});
		}
		
		function onPaneWheel(e) {
			e.deltaY < 0
				? onPrevSentenceCtrl()
				: onNextSentenceCtrl();
		}
		
		function onClosingAreaClick() {
			app.isPopupOpen(function(res) {
				if (!res) {
					api.destroy();
					app.event('Reader', 'Stop', 'Close area');
				}
			});
		}
		
		
		function onStartCtrl() {
			isRunning ? api.stop() : api.start();
		}
		
		function onNextWordCtrl() {
			isRunning && api.stop();
			
			token = parser.nextWord();
			
			dNone($info);
			updateWord();
			updateContext();
		}
		
		function onPrevWordCtrl() {
			isRunning && api.stop();
			
			token = parser.prevWord();
			
			dNone($info);
			updateWord();
			updateContext();
		}
		
		function onNextSentenceCtrl() {
			isRunning && api.stop();
			
			token = parser.nextSentense();
			
			dNone($info);
			updateWord();
			updateContext();
		}
		
		function onPrevSentenceCtrl() {
			isRunning && api.stop();
			
			token = parser.prevSentense();
				
			dNone($info);
			updateWord();
			updateContext();
		}
		
		function onLastWordCtrl() {
			isRunning && api.stop();
			
			token = parser.lastWord();
				
			dNone($info);
			updateWord();
			updateContext();
		}
		
		function onFirstWordCtrl() {
			isRunning && api.stop();
			
			token = parser.firstWord();
			
			dNone($info);
			updateWord();
			updateContext();
		}
		
		
		function onIncreaseWpmCtrl() {
			app.set('wpm', Math.min(app.get('wpm')+WPM_STEP, MAX_WPM));
			updatePanels();
		}
		
		function onDecreaseWpmCtrl() {
			app.set('wpm', Math.max(app.get('wpm')-WPM_STEP, MIN_WPM));
			updatePanels();
		}
		
		
		function onIncreaseFontCtrl() {
			app.set('fontSize', Math.min(app.get('fontSize')+1, MAX_FONT));
			updateWrapper();
			updateFocusPoint();
			updateWord();
		}
		
		function onDecreaseFontCtrl() {
			app.set('fontSize', Math.max(app.get('fontSize')-1, MIN_FONT));
			updateWrapper();
			updateFocusPoint();
			updateWord();
		}
		
		
		function onCloseCtrl() {
			api.destroy();
			app.event('Reader', 'Stop', 'Close button');
		}
		
		function onThemeCtrl() {
			app.set('darkTheme', !app.get('darkTheme'));
			updateWrapper();
		}
		
		function onBackgroundCtrl() {
			app.set('transparentBg', !app.get('transparentBg'));
			updateWrapper();
		}
		
		
		function onWindowResize() {
			updateFocusPoint();
		}
		
		function onKeydown(e) {
			switch (e.keyCode) {
				case 27: // esc
					app.stopEvent(e);
					onCloseCtrl();
					app.event('Reader', 'Stop', 'Hotkey (Esc)');
					break;
				case 32: // space
				case 13: // enter
					app.stopEvent(e);
					onStartCtrl();
					break;
				case 39: // right
					app.stopEvent(e);
					e.ctrlKey
						? onNextSentenceCtrl()
						: e.altKey ? onLastWordCtrl() : onNextWordCtrl();
					break;
				case 37: // left
					app.stopEvent(e);
					e.ctrlKey
						? onPrevSentenceCtrl()
						: e.altKey ? onFirstWordCtrl() : onPrevWordCtrl();
					break;
				case 35: // end
					app.stopEvent(e);
					onLastWordCtrl();
					break;
				case 36: // home
					app.stopEvent(e);
					onFirstWordCtrl();
					break;
				case 38: // up
					app.stopEvent(e);
					e.ctrlKey ? onIncreaseFontCtrl() : onIncreaseWpmCtrl();
					break;
				case 40: // down
					app.stopEvent(e);
					e.ctrlKey ? onDecreaseFontCtrl() : onDecreaseWpmCtrl();
					break;
				case 107: // numpad +
				case 187: // +
					app.stopEvent(e);
					onIncreaseFontCtrl();
					break;
				case 109: // numpad -
				case 189: // -
					app.stopEvent(e);
					onDecreaseFontCtrl();
					break;
			}
		}
		
		
		
		var api = this,
			isRunning = false,
			wasRun = false,
			
			$wrapper            = createElement('div', cls('wrapper'), $body),
			
			$pane               = createElement('div', cls('pane'), $wrapper),
			
			$contextBefore      = createElement('div', cls('context', 'context_before'), $pane),
			$wordWrap           = createElement('div', cls('wordWrap'), $pane),
			$word               = createElement('div', cls('word'), $wordWrap),
			$focusLines         = createElement('div', cls('focusLines'), $wordWrap),
			$focusDashes        = createElement('div', cls('focusDashes'), $wordWrap),
			$contextAfter       = createElement('div', cls('context', 'context_after'), $pane),
			
			$info               = createElement('div', cls('info'), $pane, app.t('loading')),
			
			$closingAreaLeft    = createElement('div', cls('closingArea','closingArea_left'), $wrapper),
			$closingAreaRight   = createElement('div', cls('closingArea','closingArea_right'), $wrapper),
			
			// Top panel
			$topPanel           = createElement('div', cls('panel', 'panel_top'), $wrapper),
			
			$topPanelLeft       = createElement('div', cls('topPanelLeft'), $topPanel),
			$fontAdjust         = createElement('div', cls('adjust','adjust_font'), $topPanelLeft, '<span>aA</span>'),
			$ctrlDecFont        = createElement('i', cls('topPanelBtn','topPanelBtn_adjust','topPanelBtn_minus'), $fontAdjust, null, app.t('ctrl_smallerFont')),
			$ctrlIncFont        = createElement('i', cls('topPanelBtn','topPanelBtn_adjust','topPanelBtn_plus'), $fontAdjust, null, app.t('ctrl_largerFont')),
			$wpmAdjust          = createElement('div', cls('adjust','adjust_wpm'), $topPanelLeft),
			$wpmText            = createElement('span', null, $wpmAdjust),
			$ctrlDecWpm         = createElement('i', cls('topPanelBtn','topPanelBtn_adjust','topPanelBtn_minus'), $wpmAdjust, null, app.t('ctrl_decSpeed')),
			$ctrlIncWpm         = createElement('i', cls('topPanelBtn','topPanelBtn_adjust','topPanelBtn_plus'), $wpmAdjust, null, app.t('ctrl_incSpeed')),
			
			$topPanelRight      = createElement('div', cls('topPanelRight'), $topPanel),
			$menuGroup1         = createElement('div', cls('menuGroup'), $topPanelRight),
			$menuBtnClose       = createElement('div', cls('topPanelBtn','topPanelBtn_menu','topPanelBtn_close'), $menuGroup1, null, app.t('ctrl_close')),
			$menuGroup2         = createElement('div', cls('menuGroup'), $topPanelRight),
			$menuBtnTheme       = createElement('div', cls('topPanelBtn','topPanelBtn_menu','topPanelBtn_theme'), $menuGroup2, null, app.t('ctrl_switchTheme')),
			$menuBtnBackground  = createElement('div', cls('topPanelBtn','topPanelBtn_menu','topPanelBtn_background'), $menuGroup2, null, app.t('ctrl_bgTransparency')),
			
			// Bottom panel
			$botPanel           = createElement('div', cls('panel', 'panel_bottom'), $wrapper),
			$ctrlStart          = createControl(['start'], $botPanel, app.t('ctrl_playPause')),
			$ctrlNextWord       = createControl(['nextWord'], $botPanel, app.t('ctrl_nextWord')),
			$ctrlNextSentence   = createControl(['nextSentence'], $botPanel, app.t('ctrl_nextSentence')),
			$ctrlLastWord       = createControl(['lastWord'], $botPanel, app.t('ctrl_lastWord')),
			$ctrlPrevWord       = createControl(['prevWord'], $botPanel, app.t('ctrl_prevWord')),
			$ctrlPrevSentence   = createControl(['prevSentence'], $botPanel, app.t('ctrl_prevSentence')),
			$ctrlFirstWord      = createControl(['firstWord'], $botPanel, app.t('ctrl_firstWord')),
			
			focusPoint = 0,
			bodyOverflowBefore = $body.style.overflow,
			token, timeout;
		
		
		
		api.start = function() {
			if (isRunning) return;
			isRunning = true;
			
			dNone($contextBefore);
			dNone($contextAfter);
			dNone($info);
			dNone($topPanel);
			dNone($botPanel);
			
			updateWrapper();
			
			next(true);
		}
		
		api.stop = function() {
			clearTimeout(timeout);
			
			if (!isRunning) return;
			isRunning = false;
			
			updateWrapper();
			updateContext();
			updateWord(); // update is needed if paused on an "empty word" at the end of a sentence
			
			dBlock($contextBefore);
			dBlock($contextAfter);
			dBlock($topPanel);
			dBlock($botPanel);
		}
		
		api.destroy = function() {
			api.stop();
			
			app.off(window, "resize", onWindowResize);
			app.off($wrapper, "keydown", onKeydown);
			
			$wrapper.setAttribute("is-closing", "true");
			
			setTimeout(function() {
				try {
					$body.removeChild($wrapper);
				}
				catch(e) { }
			}, 500);
			
			// avoiding possible issues
			// (especially on sites that use History API and modal windows with custom scrolling area;
			// like vk.com)
			if (bodyOverflowBefore !== "hidden") {
				$body.style.overflow = bodyOverflowBefore;
			}
			
			parser.destroy();
			parser = null;
			
			app.onReaderDestroy();
		}
		
		api.onPopupSettings = function(key, value) {
			switch (key) {
				case 'vPosition':
					updateWrapper();
					break;
				case 'focusMode':
					updateWrapper();
					updateFocusPoint();
					updateWord();
					break;
				case 'entityAnalysis':
					parser.parse();
					if (wasRun) {
						token = parser.wordAtIndex(token.startIndex+1);
						updateWord();
						updateContext();
					}
					break;
			}
		}
		
		
		;(function(date) {
			parser.parse();
			app.event(
				'Parsing time',
				app.get('entityAnalysis') ? 'Advanced' : 'Simple',
				app.roundExp(new Date() - date)
			);
		})(new Date());
		
		
		if (!parser.length) {
			app.event('Error', 'Can\'t parse', app.get('entityAnalysis') ? 'Advanced' : 'Simple');
			alert(app.t('cantParse'));
			// The destroy should be called after the reader is created and saved in the app (into main.js)
			setTimeout(function() {
				api.destroy();
			}, 100);
		}
		else {
			$body.style.overflow = "hidden";
			
			$wrapper.tabIndex = 1;
			
			updateWrapper();
			updateFocusPoint();
			updatePanels();
			
			if (app.get('autostart')) {
				dNone($info);
				
				setTimeout(function() {
					api.start();
				}, 500);
			}
			else {
				dBlock($topPanel);
				dBlock($botPanel);
				
				$info.innerHTML = app.t('clickToStart');
			}
			
			$wrapper.setAttribute("is-closing", "false");
			$wrapper.focus();
			
			
			
			app.on($wrapper, "keydown", onKeydown);
			
			app.on($pane, "click", onPaneClick);
			app.on($closingAreaLeft, "click", onClosingAreaClick);
			app.on($closingAreaRight, "click", onClosingAreaClick);
			
			app.on($pane, "wheel", onPaneWheel);
			app.on($closingAreaLeft, "wheel", onPaneWheel);
			app.on($closingAreaRight, "wheel", onPaneWheel);
			
			app.on($ctrlStart, "click", onStartCtrl);
			app.on($ctrlNextWord, "click", onNextWordCtrl);
			app.on($ctrlNextSentence, "click", onNextSentenceCtrl);
			app.on($ctrlLastWord, "click", onLastWordCtrl);
			app.on($ctrlPrevWord, "click", onPrevWordCtrl);
			app.on($ctrlPrevSentence, "click", onPrevSentenceCtrl);
			app.on($ctrlFirstWord, "click", onFirstWordCtrl);
			
			app.on($ctrlDecWpm, "click", onDecreaseWpmCtrl);
			app.on($ctrlIncWpm, "click", onIncreaseWpmCtrl);
			
			app.on($ctrlDecFont, "click", onDecreaseFontCtrl);
			app.on($ctrlIncFont, "click", onIncreaseFontCtrl);
			
			app.on($menuBtnTheme, "click", onThemeCtrl);
			app.on($menuBtnBackground, "click", onBackgroundCtrl);
			app.on($menuBtnClose, "click", onCloseCtrl);
			
			app.on(window, "resize", onWindowResize);
			app.on(window, "popstate", onCloseCtrl);
		}
	};
	
	
})(window.fastReader);
