

(function(app) {
	
	function onCheckbox(api, $checkbox) {
		app.sendMessageToExtension({type: 'settingsSet', key: $checkbox.name, value: $checkbox.checked});
		app.sendMessageToSelectedTab({type: 'popupSettings', key: $checkbox.name, value: $checkbox.checked});
	}
	
	function onExternalLinkClick(e) {
		window.open(e.target.href);
	}
	
	
	function init(settings) {
		app.each(document.querySelectorAll('.j-checkbox'), function($elem) {
			$elem.checked = settings[$elem.name];
			new app.Checkbox($elem, onCheckbox);
		});
		
		app.each(document.querySelectorAll('a[href^=http]'), function($elem) {
			app.on($elem, 'click', onExternalLinkClick);
		});
	}
	
	
	app.sendMessageToExtension({type: 'settingsGet'}, init);
	
	
})(window.fastReaderPopup);
