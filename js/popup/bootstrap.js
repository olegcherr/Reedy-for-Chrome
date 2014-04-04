

(function(app) {
	
	function querySelector(selector) {
		return document.querySelector(selector);
	}
	
	function querySelectorAll(selector) {
		return document.querySelectorAll(selector);
	}
	
	
	function onTabMousedown(e) {
		setActiveTab(e.target.getAttribute('tab-id'));
	}
	
	function onExternalLinkClick(e) {
		app.event('External link', e.target.href);
		window.open(e.target.href);
	}
	
	
	function onCheckbox(value, $checkbox, api) {
		app.setSettings($checkbox.name, value);
	}
	
	function onRange(value, $input, api) {
		app.setSettings($input.name, value);
	}
	
	
	function onStartReadingClick() {
		app.sendMessageToExtension({type: 'startReading'});
		app.event('Reader', 'Open', 'Popup');
		window.close();
	}
	
	function onStartSelectorClick() {
		app.sendMessageToExtension({type: 'startSelector'});
		app.event('Content selector', 'Start', 'Popup');
		window.close();
	}
	
	
	function setActiveTab(id) {
		localStorage["tabId"] = id;
		
		$body.setAttribute('active-tab', id);
		
		app.each($tabs, function($tab) {
			$tab.setAttribute('active', $tab.getAttribute('tab-id') === id);
		});
		app.each($content, function($elem) {
			$elem.setAttribute('active', $elem.getAttribute('content-id') === id);
		});
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
	
	
	
	var $body = querySelector('body'),
		$startReadingBtn = querySelector('.j-startReadingBtn'),
		$startSelectorBtn = querySelector('.j-startContentSelectorBtn'),
		$tabs = querySelectorAll('.j-tab'),
		$content = querySelectorAll('.j-content');
	
	
	app.each(querySelectorAll('[i18n]'), function($elem) {
		$elem.innerHTML = app.t($elem.getAttribute('i18n'));
	});
	
	app.each(querySelectorAll('a[href^=http]'), function($elem) {
		app.on($elem, 'click', onExternalLinkClick);
	});
	
	
	app.each($tabs, function($elem) {
		app.on($elem, "mousedown", onTabMousedown);
	});
	
	localStorage["tabId"] && setActiveTab(localStorage["tabId"]);
	
	
	app.sendMessageToExtension({type: 'getSelection'}, function(sel) {
		sel = sel && sel.length;
		$startReadingBtn.setAttribute('hidden', !sel);
		$startSelectorBtn.setAttribute('hidden', !!sel);
	});
	
	app.sendMessageToExtension({type: 'getSettings'}, initControls);
	
	chrome.extension.connect({name: "Popup"});
	
	
	app.on($startReadingBtn, "click", onStartReadingClick);
	app.on($startSelectorBtn, "click", onStartSelectorClick);
	
	
})(window.fastReaderPopup);
