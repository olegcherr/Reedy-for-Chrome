

(function(app) {
	
	function createElement(tagName, className, $appendTo, html) {
		var $elem = document.createElement(tagName);
		className != null && ($elem.className = className);
		$appendTo && $appendTo.appendChild($elem);
		html != null && ($elem.innerHTML = html);
		return $elem;
	}
	
	
	var LNG_ON  = 'ON',
		LNG_OFF = 'OFF';
	
	
	app.Checkbox = function($checkbox, onChange) {
		
		function updateState() {
			var stateBefore = $checkbox.checked;
			
			$bg.setAttribute('checked', api.isChecked);
			$bar.innerHTML = api.isChecked ? LNG_ON : LNG_OFF;
			$checkbox.checked = api.isChecked;
			
			stateBefore !== $checkbox.checked && onChange(api, $checkbox);
		}
		
		function toggle() {
			api.isChecked = !api.isChecked;
			updateState();
		}
		
		
		var api = this,
			
			$bg     = createElement('span', 'e-Checkbox-bg', $checkbox.parentNode),
			$bar    = createElement('span', 'e-Checkbox-bar', $bg);
		
		
		api.$checkbox = $checkbox;
		
		api.setState = function(value) {
			api.isChecked = !!value;
			updateState();
		}
		
		
		api.isChecked = $checkbox.checked;
		updateState();
		
		$checkbox.style.display = 'none';
		
		
		app.on($bg, 'mousedown', toggle);
		
	}
	
	
})(window.fastReaderPopup);
