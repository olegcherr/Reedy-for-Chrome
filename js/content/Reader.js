

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
				data = justRun && data || parser.nextWord();
				
				updateWord();
				
				timeout = setTimeout(
					next,
					wasRun
						? (60000/app.get('wpm'))*(data.isDelayed && app.get('smartSlowing') ? 2 : 1)
						: 500
				);
				
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
			if (data) {
				var context = parser.getContext();
				$contextBefore.innerHTML = context.before.replace(/\n/g, "<br/>");
				$contextAfter.innerHTML = context.after.replace(/\n/g, "<br/>");
			}
		}
		
		function updateWord() {
			var word = data.word;
			
			$word.style.left = '';
			
			if (app.get('focusMode')) {
				var stop = Math.round((word.length+1)*0.4) - 1;
				$word.innerHTML = word.substring(0, stop)+'<span>'+word[stop]+'</span>'+word.substring(stop+1);
				
				var letterRect = $word.querySelector('span').getBoundingClientRect();
				$word.style.left = Math.round(focusPoint - letterRect.left - letterRect.width/2)+'px';
			}
			else {
				$word.innerHTML = word;
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
				res || onCloseCtrl();
			});
		}
		
		function onInputBlur() {
			$input.focus();
		}
		
		
		function onStartCtrl() {
			isRunning ? api.stop() : api.start();
		}
		
		function onNextWordCtrl() {
			isRunning && api.stop();
			
			data = parser.nextWord();
			
			dNone($info);
			updateWord();
			updateContext();
		}
		
		function onPrevWordCtrl() {
			isRunning && api.stop();
			
			data = parser.prevWord();
			
			dNone($info);
			updateWord();
			updateContext();
		}
		
		function onNextSentenceCtrl() {
			isRunning && api.stop();
			
			data = parser.nextSentense();
			
			dNone($info);
			updateWord();
			updateContext();
		}
		
		function onPrevSentenceCtrl() {
			isRunning && api.stop();
			
			data = parser.prevSentense();
				
			dNone($info);
			updateWord();
			updateContext();
		}
		
		function onLastWordCtrl() {
			isRunning && api.stop();
			
			data = parser.lastWord();
				
			dNone($info);
			updateWord();
			updateContext();
		}
		
		function onFirstWordCtrl() {
			isRunning && api.stop();
			
			data = parser.firstWord();
			
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
			$input              = createElement('input', null, $wrapper),
			
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
			data, timeout;
		
		
		$body.style.overflow = "hidden";
		
		
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
			
			dBlock($contextBefore);
			dBlock($contextAfter);
			dBlock($topPanel);
			dBlock($botPanel);
		}
		
		api.destroy = function() {
			api.stop();
			
			app.off(window, "resize", onWindowResize);
			
			app.off($input, "keydown", onKeydown);
			app.off($input, "blur", onInputBlur);
			
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
					data = parser.wordAtIndex(data.start+1);
					updateWord();
					updateContext();
					break;
			}
		}
		
		
		
		app.on($input, "keydown", onKeydown);
		app.on($input, "blur", onInputBlur);
		
		app.on($pane, "click", onPaneClick);
		app.on($pane, "wheel", onPaneWheel);
		
		app.on($closingAreaLeft, "click", onClosingAreaClick);
		app.on($closingAreaRight, "click", onClosingAreaClick);
		
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
		
		
		
		parser.parse();
		
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
		
		$input.focus();
		
	};
	
	
})(window.fastReader);
