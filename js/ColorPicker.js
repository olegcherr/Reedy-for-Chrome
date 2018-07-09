

(function(app) {

	const CLS_WRAPPER = "e-ColorPicker-wrapper";

	app.ColorPicker = function($input, onChange) {

		const api = this,
			$wrapper = document.createElement("div");
		let savedValue = $input.value;

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

		api.$input = $input;
		api.$wrapper = $wrapper;

		api.getValue = function() {
			return $input.value;
		};

		api.setValue = function(value) {
			$input.value = value;
			updateWrapper();
		};

		$wrapper.className = CLS_WRAPPER;
		$input.parentNode.appendChild($wrapper);
		$wrapper.appendChild($input);

		app.on($input, "change", onInputChange);

		updateWrapper();
	}

})(window.reedy);
