

chrome.runtime.getBackgroundPage(function(bgWindow) {
	
	function querySelector(selector) {
		return document.querySelector(selector);
	}
	
	function querySelectorAll(selector) {
		return document.querySelectorAll(selector);
	}
	
	function getTextSelection(callback) {
		app.sendMessageToSelectedTab({type: 'getSelection'}, function(sel) {
			callback(sel || '');
		});
	}
	
	
	function onTabMousedown(e) {
		setActiveTab(e.target.getAttribute('tab-id'));
	}
	
	function onExternalLinkClick(e) {
		app.event('External link', e.target.href);
		window.open(e.target.href);
	}
	
	function onSwitchBtnClick(e) {
		var viewName = e.target.getAttribute('switch-to');
		switchToView(viewName);
		app.event('Popup', 'Switch to', viewName);
	}
	
	
	function onCheckbox(value, $checkbox, api) {
		app.setSettings($checkbox.name, value);
	}
	
	function onRange(value, $input, api) {
		app.setSettings($input.name, value);
	}
	
	
	function onStartReadingClick() {
		app.event('Reader', 'Open', 'Popup');
		startReading();
	}
	
	function onStartSelectorClick() {
		app.event('Content selector', 'Start', 'Popup');
		startSelector();
	}
	
	function onCloseReaderClick() {
		app.event('Reader', 'Close', 'Popup');
		closeReader();
	}
	
	function onOfflineBtnClick() {
		app.event('Offline', 'Open');
		window.open(app.offlineUrl);
	}
	
	
	function onKeyDown(e) {
		switch (e.keyCode) {
			case 83: // S
				e.altKey && getTextSelection(function(text) {
					if (text.length) {
						app.event('Reader', 'Open', 'Shortcut in popup (Alt+S)');
						startReading();
					}
					else {
						app.event('Content selector', 'Start', 'Shortcut in popup (Alt+S)');
						startSelector();
					}
				});
				break;
		}
	}
	
	
	function startReading() {
		app.sendMessageToSelectedTab({type: 'startReading'});
		window.close();
	}
	
	function startSelector() {
		app.sendMessageToSelectedTab({type: 'startSelector'});
		window.close();
	}
	
	function closeReader() {
		app.sendMessageToSelectedTab({type: 'closeReader'});
		window.close();
	}
	
	function setActiveTab(id) {
		$tabsWrap.setAttribute('active-tab', id);
		
		app.each($tabs, function($tab) {
			$tab.setAttribute('active', $tab.getAttribute('tab-id') === id);
		});
		app.each($content, function($elem) {
			$elem.setAttribute('active', $elem.getAttribute('tab-id') === id);
		});
		
		localStorage["tabId"] = id;
	}
	
	function switchToView(name) {
		app.each($views, function($view) {
			$view.setAttribute('active', $view.getAttribute('view-name') === name);
		});
		$body.setAttribute('active-view', name);
		
		localStorage["viewName"] = name;
	}
	
	function initControls(settings) {
		app.each(querySelectorAll('.j-checkbox'), function($elem) {
			$elem.checked = settings[$elem.name];
			new app.Checkbox($elem, onCheckbox);
		});
		
		app.each(querySelectorAll('.j-range'), function($elem) {
			$elem.value = settings[$elem.name];
			new app.Range($elem, +$elem.getAttribute('min-value'), +$elem.getAttribute('max-value'), onRange);
		});
	}
	
	
	
	var app = bgWindow.fastReader,
		$body = querySelector('body'),
		$startReadingBtn = querySelector('.j-startReadingBtn'),
		$startSelectorBtn = querySelector('.j-startContentSelectorBtn'),
		$closeReaderBtn = querySelector('.j-closeReaderBtn'),
		$views = querySelectorAll('[view-name]'),
		$tabsWrap = querySelector('.j-tabs'),
		$tabs = querySelectorAll('.j-tab'),
		$content = querySelectorAll('.j-content');
	
	
	// TODO: This is a temporary stuff that helps to be sure that `getBackgroundPage` works always fine (its callbacks run in the correct order)
	if (!app.Checkbox || !app.Range) {
		$body.innerHTML = '<br/><b>Something goes wrong.</b><br/>Please try to reopen this popup window.<br/><br/><b>Произошла ошибка.</b><br/>Пожалуйста, попробуйте переоткрыть это окно.<br/><br/>';
		$body.style.textAlign = 'center';
		
		localStorage['temp_cid'] = Math.round(2147483647 * Math.random());
		
		var params = [];
		params.push('tid='+('update_url' in chrome.runtime.getManifest() ? 'UA-5025776-15' : 'UA-5025776-14'));
		params.push('cid='+localStorage['temp_cid']);
		params.push('cd1=temp_'+localStorage['temp_cid']);
		params.push('ul='+navigator.language);
		params.push('t=event');
		params.push('ec=Error');
		params.push('ea=getBackgroundPage');
		
		var xhr = new XMLHttpRequest();
		xhr.open("GET", 'http://www.google-analytics.com/collect?v=1&'+params.join('&'), true);
		xhr.send(null); 
		
		return;
	}
	
	
	app.on(window, "error", function(e) {
		app.trackJSError(e, 'JS Popup');
	});
	
	chrome.runtime.connect({name: "Popup"});
	
	localStorage["viewName"] && switchToView(localStorage["viewName"]);
	localStorage["tabId"] && setActiveTab(localStorage["tabId"]);
	
	app.localizeElements(document);
	
	app.getSettings(null, initControls);
	
	/**
	 * Preparing buttons
	 * `getTextSelection` - is a pretty diffcult method, so we check for the reader state at first
	 */
	app.sendMessageToSelectedTab({type: 'isReaderStarted'}, function(isReaderStarted) {
		if (isReaderStarted) {
			$startSelectorBtn.setAttribute('hidden', true);
			$closeReaderBtn.setAttribute('hidden', false);
		}
		else {
			app.sendMessageToSelectedTab({type: 'isOfflinePage'}, function(isOfflinePage) {
				if (isOfflinePage)
					$startSelectorBtn.setAttribute('hidden', true);
				else
					getTextSelection(function(text) {
						$startReadingBtn.setAttribute('hidden', !text.length);
						$startSelectorBtn.setAttribute('hidden', !!text.length);
					});
			});
		}
	});
	
	
	app.on($startReadingBtn, "click", onStartReadingClick);
	app.on($startSelectorBtn, "click", onStartSelectorClick);
	app.on($closeReaderBtn, "click", onCloseReaderClick);
	
	app.each(querySelectorAll('a[href^=http]'), function($elem) {
		app.on($elem, 'click', onExternalLinkClick);
	});
	app.each(querySelectorAll('[switch-to]'), function($elem) {
		app.on($elem, 'click', onSwitchBtnClick);
	});
	
	app.each($tabs, function($elem) {
		app.on($elem, "click", onTabMousedown);
	});
	
	app.on(window, "keydown", onKeyDown);
	
	app.on(querySelector('.j-offlineBtn'), "click", onOfflineBtnClick);
	
	
});
