

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
		app.sendMessageToExtension({type: 'settingsSet', key: $checkbox.name, value: value});
		app.sendMessageToSelectedTab({type: 'popupSettings', key: $checkbox.name, value: value});
	}
	
	function onRange(value, $input, api) {
		app.sendMessageToExtension({type: 'settingsSet', key: $input.name, value: value});
		app.sendMessageToSelectedTab({type: 'popupSettings', key: $input.name, value: value});
	}
	
	
	function onStartReadingClick() {
		window.close();
		app.event('Reader', 'Open', 'Popup');
		app.sendMessageToSelectedTab({type: 'startReading'});
	}
	
	function onStartSelectorClick() {
		window.close();
		app.event('Content selector', 'Start', 'Popup');
		app.sendMessageToSelectedTab({type: 'startSelector'});
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
		var $elem, temp;
		
		
		
		
		
		
		
		
		
		
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
	
	
	app.sendMessageToSelectedTab({type: 'getSelection'}, function(sel) {
		$startReadingBtn.setAttribute('hidden', !sel.length);
		$startSelectorBtn.setAttribute('hidden', !!sel.length);
	});
	
	app.sendMessageToExtension({type: 'settingsGet'}, initControls);
	
	chrome.extension.connect({name: "Popup"});
	
	
	app.on($startReadingBtn, "click", onStartReadingClick);
	app.on($startSelectorBtn, "click", onStartSelectorClick);
	
	
})(window.fastReaderPopup);
