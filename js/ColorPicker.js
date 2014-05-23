

(function(app) {
	
	var CLS_WRAPPER = "e-ColorPicker-wrapper";
	
	app.ColorPicker = function($input, onChange) {
		
		function onInputChange() {
			if ($input.value !== savedValue) {
				savedValue = $input.value;
				updateWrapper();
				onChange($input.value, $input, api);
			}
		}
		
		function updateWrapper() {
			$wrapper.style.backgroundColor = $input.value;
		}
		
		
		var api = this,
			savedValue = $input.value,
			$wrapper = document.createElement("div");
		
		
		api.$input = $input;
		api.$wrapper = $wrapper;
		
		api.getValue = function() {
			return $input.value;
		}
		
		api.setValue = function(value) {
			$input.value = value;
			updateWrapper();
		}
		
		
		$wrapper.className = CLS_WRAPPER;
		$input.parentNode.appendChild($wrapper);
		$wrapper.appendChild($input);
		
		
		app.on($input, "change", onInputChange);
		
		
		updateWrapper();
	}
	
})(window.reedy);
