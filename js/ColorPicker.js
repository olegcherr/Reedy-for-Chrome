

(function(app) {

	app.ColorPicker = function($input, onChange) {

		const api = this;
		let savedValue = $input.value;

		function onInputChange() {
			if ($input.value !== savedValue) {
				savedValue = $input.value;
				updateField();
				onChange($input.value, $input, api);
			}
		}

		function updateField() {
			$input.style.backgroundColor = $input.value;
			// compute foreground color with highest contrast
			let rgb = getComputedStyle($input).backgroundColor
				.replace(/[^\d,]/g, '').split(',').slice(0, 3);
			rgb = rgb.map(c => c/255.0).map(c =>
				c > 0.03928 ? ((c+0.055)/1.055)**2.4 : c/12.92);
			const lum = 0.2126*rgb[0] + 0.7152*rgb[1] + 0.0722*rgb[2];
			$input.style.color = lum > 0.179 ? 'black' : 'white';
		}

		api.$input = $input;

		api.getValue = function() {
			return $input.value;
		};

		api.setValue = function(value) {
			$input.value = value;
			updateField();
		};

		app.on($input, "change", onInputChange);

		updateField();
	}

})(window.reedy);
