

(function(app) {
	
	function createElement(tagName, className, $appendTo, html) {
		var $elem = document.createElement(tagName);
		className != null && ($elem.className = className);
		$appendTo && $appendTo.appendChild($elem);
		html != null && ($elem.innerHTML = html);
		return $elem;
	}
	
	
	var CLS_BG = "e-Checkbox-bg",
		CLS_BAR = "e-Checkbox-bar",
		
		LNG_ON  = "ON",
		LNG_OFF = "OFF";
	
	
	app.Checkbox = function($checkbox, onChange) {
		
		function updateState() {
			var checked = $checkbox.checked;
			
			$bg.setAttribute("checked", checked);
			$bar.innerHTML = checked ? LNG_ON : LNG_OFF;
			
			savedState !== checked && onChange(checked, $checkbox, api);
			savedState = checked;
		}
		
		function onMouseDown() {
			$checkbox.checked = !$checkbox.checked;
			updateState();
		}
		
		
		var api = this,
			savedState = $checkbox.checked,
			$bg  = createElement("span", CLS_BG, $checkbox.parentNode),
			$bar = createElement("span", CLS_BAR, $bg);
		
		
		api.$checkbox = $checkbox;
		
		api.getState = function() {
			return $checkbox.checked;
		}
		
		api.setState = function(value) {
			$checkbox.checked = !!value;
			updateState();
		}
		
		
		app.on($bg, "mousedown", onMouseDown);
		
		
		$checkbox.style.display = "none";
		updateState();
		
	}
	
	
})(window.reedy);
