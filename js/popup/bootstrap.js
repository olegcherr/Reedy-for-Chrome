

(function(app) {
	
	function onCheckbox(api, $checkbox) {
		app.sendMessageToExtension({type: 'settingsSet', key: $checkbox.name, value: $checkbox.checked});
		app.sendMessageToSelectedTab({type: 'popupSettings', key: $checkbox.name, value: $checkbox.checked});
	}
	
	
	function init(settings) {
		var $temp = document.querySelectorAll('.j-checkbox'), i;
		
		for (i = 0; i < $temp.length; i++) {
			$temp[i].checked = settings[$temp[i].name];
			new app.Checkbox($temp[i], onCheckbox);
		}
	}
	
	
	app.sendMessageToExtension({type: 'settingsGet'}, init);
	
	
})(window.fastReaderPopup);
