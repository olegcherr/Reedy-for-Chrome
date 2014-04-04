

(function(app) {
	
	function onTabCall(e) {
		setActiveTab(e.target.getAttribute('tab-id'));
	}
	
	function onCheckbox(value, $checkbox, api) {
		app.sendMessageToExtension({type: 'settingsSet', key: $checkbox.name, value: value});
		app.sendMessageToSelectedTab({type: 'popupSettings', key: $checkbox.name, value: value});
	}
	
	function onRange(value, $input, api) {
		app.sendMessageToExtension({type: 'settingsSet', key: $input.name, value: value});
		app.sendMessageToSelectedTab({type: 'popupSettings', key: $input.name, value: value});
	}
	
	function onExternalLinkClick(e) {
		app.event('External link', e.target.href);
		window.open(e.target.href);
	}
	
	function onStartReadingClick() {
		window.close();
		app.event('Reader', 'Open', 'Popup');
		app.sendMessageToSelectedTab({type: 'startReading'});
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
	
	function init(settings) {
		var $elem, temp;
		
		
		app.each(document.querySelectorAll('[i18n]'), function($elem) {
			$elem.innerHTML = app.t($elem.getAttribute('i18n'));
		});
		
		
		app.each($tabs, function($elem) {
			app.on($elem, "mousedown", onTabCall);
		});
		
		if (temp = localStorage["tabId"])
			setActiveTab(temp);
		
		
		app.each(document.querySelectorAll('.j-checkbox'), function($elem) {
			$elem.checked = settings[$elem.name];
			new app.Checkbox($elem, onCheckbox);
		});
		
		app.each(document.querySelectorAll('.j-range'), function($elem) {
			$elem.value = settings[$elem.name];
			new app.Range($elem, +$elem.getAttribute('min-value'), +$elem.getAttribute('max-value'), onRange);
		});
		
		
		app.each(document.querySelectorAll('a[href^=http]'), function($elem) {
			app.on($elem, 'click', onExternalLinkClick);
		});
		
		
		$elem = document.querySelector('.j-startReadingBtnWrapper');
		app.sendMessageToSelectedTab({type: 'getSelection'}, function(sel) {
			sel && sel.length && ($elem.style.display = "block");
		});
		app.on($elem, "click", onStartReadingClick);
	}
	
	
	var $body = document.querySelector('body'),
		$tabs = document.querySelectorAll('.j-tab'),
		$content = document.querySelectorAll('.j-content');
	
	
	app.sendMessageToExtension({type: 'settingsGet'}, init);
	
	chrome.extension.connect({name: "Popup"});
	
	
})(window.fastReaderPopup);
