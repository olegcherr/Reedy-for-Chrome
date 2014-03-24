

(function(app) {
	
	function onCheckbox(value, $checkbox, api) {
		app.sendMessageToExtension({type: 'settingsSet', key: $checkbox.name, value: value});
		app.sendMessageToSelectedTab({type: 'popupSettings', key: $checkbox.name, value: value});
	}
	
	function onRange(value, $input, api) {
		console.log(arguments);
		app.sendMessageToExtension({type: 'settingsSet', key: $input.name, value: value});
		app.sendMessageToSelectedTab({type: 'popupSettings', key: $input.name, value: value});
	}
	
	function onExternalLinkClick(e) {
		window.open(e.target.href);
	}
	
	
	function init(settings) {
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
	}
	
	
	app.sendMessageToExtension({type: 'settingsGet'}, init);
	
	chrome.extension.connect({name: "Popup"});
	
	
})(window.fastReaderPopup);
