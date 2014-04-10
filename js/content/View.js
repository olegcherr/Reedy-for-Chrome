

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
	
	function cls() {
		for (var res = [], i = 0; i < arguments.length; i++) {
			res.push(CLS_MAIN+'-'+arguments[i]);
		}
		return res.join(' ');
	}
	
	
	
	var CLS_MAIN = 'e-FastReader',
		
		CONTEXT_CHARS_LIMIT = 2000,
		
		MIN_WPM             = 50,
		MAX_WPM             = 2000,
		WPM_STEP            = 50,
		
		MIN_FONT            = 1,
		MAX_FONT            = 7,
		
		MIN_VPOS            = 1,
		MAX_VPOS            = 5,
		
		$body = querySelector('body');
	
	
	app.View = function() {
		
		function onPopupSettings(e, key, value) {
			updateWrapper();
			
			if (key === 'focusMode') {
				updateFocusPoint();
				updateWord();
			}
		}
		
		
		function onSequencerUpdate(e, str) {
			if (!wasLaunchedSinceOpen) {
				wasLaunchedSinceOpen = true;
				updateWrapper();
			}
			
			updateWord(str);
			updateContext();
			updateProgressBar();
			updateTimeLeft();
		}
		
		function onSequencerPlay() {
			updateWrapper();
		}
		
		function onSequencerPause() {
			updateWrapper();
			updateContext();
			updateWord(); // update is needed if paused on an "empty word" at the end of a sentence
		}
		
		
		function onPaneClick() {
			var selection = window.getSelection(),
				$node = selection.anchorNode;
			
			if (selection.toString().length && $node) {
				while (($node = $node.parentNode) && $node !== $pane) {}
				if ($node === $pane)
					return;
			}
			
			app.isPopupOpen(function(res) {
				res || sequenser.toggle();
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
					api.close();
					app.event('Reader', 'Close', 'Close area');
				}
			});
		}
		
		
		function onStartCtrl() {
			sequenser.toggle();
		}
		
		function onNextWordCtrl() {
			sequenser.pause();
			sequenser.toNextToken();
		}
		
		function onPrevWordCtrl() {
			sequenser.pause();
			sequenser.toPrevToken();
		}
		
		function onNextSentenceCtrl() {
			sequenser.pause();
			sequenser.toNextSentence();
		}
		
		function onPrevSentenceCtrl() {
			sequenser.pause();
			sequenser.toPrevSentence();
		}
		
		function onLastWordCtrl() {
			sequenser.pause();
			sequenser.toLastToken();
		}
		
		function onFirstWordCtrl() {
			sequenser.pause();
			sequenser.toFirstToken();
		}
		
		
		function onIncreaseWpmCtrl() {
			app.set('wpm', app.norm(app.get('wpm')+WPM_STEP, MIN_WPM, MAX_WPM));
			updatePanels();
			updateTimeLeft();
		}
		
		function onDecreaseWpmCtrl() {
			app.set('wpm', app.norm(app.get('wpm')-WPM_STEP, MIN_WPM, MAX_WPM));
			updatePanels();
			updateTimeLeft();
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
			api.close();
			app.event('Reader', 'Close', 'Close button');
		}
		
		function onThemeCtrl() {
			app.set('darkTheme', !app.get('darkTheme'));
			updateWrapper();
		}
		
		function onBackgroundCtrl() {
			app.set('transparentBg', !app.get('transparentBg'));
			updateWrapper();
		}
		
		function onVPosUpCtrl() {
			var vPos = Math.min(app.get('vPosition')+1, MAX_VPOS);
			app.set('vPosition', vPos);
			$menuRangeText.innerHTML = vPos;
			updateWrapper();
		}
		
		function onVPosDnCtrl() {
			var vPos = Math.max(app.get('vPosition')-1, MIN_VPOS);
			app.set('vPosition', vPos);
			$menuRangeText.innerHTML = vPos;
			updateWrapper();
		}
		
		
		function onWindowResize() {
			updateFocusPoint();
		}
		
		function onWindowPopstate() {
			if (location+'' !== urlOnOpen) {
				api.close();
				app.event('Reader', 'Close', 'Popstate');
			}
		}
		
		function onKeydown(e) {
			switch (e.keyCode) {
				case 27: // esc
					app.stopEvent(e);
					api.close();
					app.event('Reader', 'Close', 'Shortcut (Esc)');
					break;
				case 32: // space
				case 13: // enter
					app.stopEvent(e);
					sequenser.toggle();
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
		
		
		function updateWrapper() {
			$wrapper.setAttribute('was-launched', wasLaunchedSinceOpen);
			$wrapper.setAttribute('is-running', !!sequenser && sequenser.isRunning);
			$wrapper.setAttribute('dark-theme', app.get('darkTheme'));
			$wrapper.setAttribute('transparent-bg', app.get('transparentBg'));
			$wrapper.setAttribute('font-size', app.get('fontSize'));
			$wrapper.setAttribute('focus-mode', app.get('focusMode'));
			$wrapper.setAttribute('v-position', app.get('vPosition'));
			$wrapper.setAttribute('progress-bar', app.get('progressBar'));
			$wrapper.setAttribute('time-left', app.get('timeLeft'));
		}
		
		function updatePanels() {
			$wpmText.innerHTML = app.get('wpm')+'wpm';
		}
		
		function updateContext() {
			if (sequenser && !sequenser.isRunning) {
				var context = sequenser.getContext(CONTEXT_CHARS_LIMIT);
				$contextBefore.innerHTML = app.htmlEncode(context.before).replace(/\n/g, "<br/>");
				$contextAfter.innerHTML = app.htmlEncode(context.after).replace(/\n/g, "<br/>");
			}
		}
		
		function updateWord(str) {
			if (!wasLaunchedSinceOpen) return;
			
			if (str === false) {
				$word.innerHTML = '';
				return;
			}
			
			str = str || sequenser.getToken().toString();
			
			$word.style.left = '';
			
			if (app.get('focusMode')) {
				var pivot = app.calcPivotPoint(str);
				$word.innerHTML = app.htmlEncode(str.substr(0, pivot))+'<span>'+app.htmlEncode(str[pivot])+'</span>'+app.htmlEncode(str.substr(pivot+1));
				
				var letterRect = $word.querySelector('span').getBoundingClientRect();
				$word.style.left = Math.round(focusPoint - letterRect.left - letterRect.width/2)+'px';
			}
			else {
				$word.innerHTML = app.htmlEncode(str);
			}
		}
		
		function updateFocusPoint() {
			var rect = $focusDashes.getBoundingClientRect();
			focusPoint = Math.floor(rect.left + Math.floor(rect.width)/2);
		}
		
		function updateProgressBar() {
			$progressBar.style.width = Math.round(sequenser.getProgress()*1000)/10+'%';
		}
		
		function updateTimeLeft() {
			var timeLeft = sequenser.getTimeLeft(),
				sec = timeLeft/1000,
				min = sec/60,
				parts = [], text;
			
			if (sec <= 10) {
				text = app.t('timeLeft_lessThan', [app.t('timeLeft_sec', [10])]);
			}
			else if (min < 10) {
				if (min >= 1)
					parts.push(app.t('timeLeft_min', [Math.floor(min)]));
				
				if (sec = Math.floor((sec%60)/10)*10)
					parts.push(app.t('timeLeft_sec', [sec]));
				
				text = app.t('timeLeft_left', [parts.join(' ')])
			}
			else {
				if (min >= 60)
					parts.push(app.t('timeLeft_h', [Math.floor(min/60)]));
				
				if (min = Math.floor((min%60)/10)*10)
					parts.push(app.t('timeLeft_min', [min]));
				
				text = app.t('timeLeft_left', [parts.join(' ')])
			}
			
			$timeLeft_word.innerHTML = $timeLeft_panel.innerHTML = text;
		}
		
		
		
		var api = this,
			isClosed = false,
			wasLaunchedSinceOpen = false,
			focusPoint = 0,
			bodyOverflowBefore = $body.style.overflow,
			urlOnOpen = location+'',
			sequenser,
			
			
			$wrapper            = createElement('div', cls('wrapper'), $body),
			
			$pane               = createElement('div', cls('pane'), $wrapper),
			
			$contextBefore      = createElement('div', cls('context', 'context_before'), $pane),
			
			$wordWrap           = createElement('div', cls('wordWrap'), $pane),
			$word               = createElement('div', cls('word'), $wordWrap),
			$focusLines         = createElement('div', cls('focusLines'), $wordWrap),
			$focusDashes        = createElement('div', cls('focusDashes'), $wordWrap),
			$progressBg         = createElement('div', cls('progressBg'), $wordWrap),
			$progressBar        = createElement('div', cls('progressBar'), $progressBg),
			$timeLeft_word      = createElement('div', cls('timeLeft','timeLeft_word'), $wordWrap),
			
			$contextAfter       = createElement('div', cls('context', 'context_after'), $pane),
			
			$info               = createElement('div', cls('info'), $pane, app.t('clickToStart')),
			
			$closingAreaLeft    = createElement('div', cls('closingArea','closingArea_left'), $wrapper),
			$closingAreaRight   = createElement('div', cls('closingArea','closingArea_right'), $wrapper),
			
			// Top panel
			$topPanel           = createElement('div', cls('panel', 'panel_top'), $wrapper),
			
			$topPanelLeft       = createElement('div', cls('topPanelLeft'), $topPanel),
			$fontAdjust         = createElement('div', cls('adjust','adjust_font'), $topPanelLeft, '<span>aA</span>'),
			$ctrlDecFont        = createElement('i', cls('topPanelBtn','topPanelBtn_regular','adjustBtn','adjustBtn_minus'), $fontAdjust, null, app.t('ctrl_smallerFont')),
			$ctrlIncFont        = createElement('i', cls('topPanelBtn','topPanelBtn_regular','adjustBtn','adjustBtn_plus'), $fontAdjust, null, app.t('ctrl_largerFont')),
			$wpmAdjust          = createElement('div', cls('adjust','adjust_wpm'), $topPanelLeft),
			$wpmText            = createElement('span', null, $wpmAdjust),
			$ctrlDecWpm         = createElement('i', cls('topPanelBtn','topPanelBtn_regular','adjustBtn','adjustBtn_minus'), $wpmAdjust, null, app.t('ctrl_decSpeed')),
			$ctrlIncWpm         = createElement('i', cls('topPanelBtn','topPanelBtn_regular','adjustBtn','adjustBtn_plus'), $wpmAdjust, null, app.t('ctrl_incSpeed')),
			$timeLeft_panel     = createElement('div', cls('timeLeft','timeLeft_panel'), $topPanelLeft),
			
			$topPanelRight      = createElement('div', cls('topPanelRight'), $topPanel),
			$menuGroup1         = createElement('div', cls('menuGroup'), $topPanelRight),
			$menuBtnClose       = createElement('div', cls('topPanelBtn','topPanelBtn_regular','menuBtn','menuBtn_close'), $menuGroup1, null, app.t('ctrl_close')),
			$menuGroup2         = createElement('div', cls('menuGroup'), $topPanelRight),
			$menuBtnTheme       = createElement('div', cls('topPanelBtn','topPanelBtn_regular','menuBtn','menuBtn_theme'), $menuGroup2, null, app.t('ctrl_switchTheme')),
			$menuBtnBackground  = createElement('div', cls('topPanelBtn','topPanelBtn_regular','menuBtn','menuBtn_background'), $menuGroup2, null, app.t('ctrl_bgTransparency')),
			$menuGroup3         = createElement('div', cls('menuGroup'), $topPanelRight, null, app.t('ctrl_vPosition')),
			$menuRangeCtrl      = createElement('div', cls('rangeCtrl'), $menuGroup3),
			$menuRangeText      = createElement('span', null, $menuRangeCtrl, app.get('vPosition')),
			$vPosUpCtrl         = createElement('div', cls('topPanelBtn','rangeCtrl-btn','rangeCtrl-btn_up'), $menuRangeCtrl),
			$vPosDnCtrl         = createElement('div', cls('topPanelBtn','rangeCtrl-btn','rangeCtrl-btn_dn'), $menuRangeCtrl),
			
			// Bottom panel
			$botPanel           = createElement('div', cls('panel', 'panel_bottom'), $wrapper),
			$ctrlStart          = createControl(['start'], $botPanel, app.t('ctrl_playPause')),
			$ctrlNextWord       = createControl(['nextWord'], $botPanel, app.t('ctrl_nextWord')),
			$ctrlNextSentence   = createControl(['nextSentence'], $botPanel, app.t('ctrl_nextSentence')),
			$ctrlLastWord       = createControl(['lastWord'], $botPanel, app.t('ctrl_lastWord')),
			$ctrlPrevWord       = createControl(['prevWord'], $botPanel, app.t('ctrl_prevWord')),
			$ctrlPrevSentence   = createControl(['prevSentence'], $botPanel, app.t('ctrl_prevSentence')),
			$ctrlFirstWord      = createControl(['firstWord'], $botPanel, app.t('ctrl_firstWord'));
		
		
		api.close = function() {
			if (isClosed) return;
			isClosed = true;
			
			sequenser.pause();
			
			app.off(app, 'popupSettings', onPopupSettings);
			app.off(window, "resize", onWindowResize);
			app.off(window, "popstate", onWindowPopstate);
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
			if (bodyOverflowBefore !== "hidden")
				$body.style.overflow = bodyOverflowBefore;
			
			app.trigger(api, 'close');
		}
		
		api.setSequenser = function(seq) {
			sequenser = seq;
			
			app.off(sequenser, 'play', onSequencerPlay);
			app.off(sequenser, 'pause', onSequencerPause);
			app.off(sequenser, 'update', onSequencerUpdate);
			
			app.on(sequenser, 'play', onSequencerPlay);
			app.on(sequenser, 'pause', onSequencerPause);
			app.on(sequenser, 'update', onSequencerUpdate);
		}
		
		
		
		$body.style.overflow = "hidden";
		$wrapper.tabIndex = 1;
		
		updateWrapper();
		updateFocusPoint();
		updatePanels();
		
		$wrapper.setAttribute('autostart', app.get('autostart'));
		$wrapper.setAttribute("is-closing", false);
		$wrapper.focus();
		
		
		
		app.on(app, 'popupSettings', onPopupSettings);
		
		app.on(window, "resize", onWindowResize);
		app.on(window, "popstate", onWindowPopstate);
		
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
		
		app.on($vPosUpCtrl, "click", onVPosUpCtrl);
		app.on($vPosDnCtrl, "click", onVPosDnCtrl);
		
		app.on($menuBtnTheme, "click", onThemeCtrl);
		app.on($menuBtnBackground, "click", onBackgroundCtrl);
		app.on($menuBtnClose, "click", onCloseCtrl);
		
	};
	
	
})(window.fastReader);
