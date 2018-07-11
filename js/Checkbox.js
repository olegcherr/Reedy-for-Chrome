

(function(app) {

	function createElement(tagName, className, $appendTo, text) {
		const $elem = document.createElement(tagName);
		className != null && ($elem.className = className);
		$appendTo && $appendTo.appendChild($elem);
		text != null && ($elem.innerText = text);
		return $elem;
	}


	const CLS_BG = "e-Checkbox-bg",
		CLS_BAR = "e-Checkbox-bar",

		LNG_ON  = "ON",
		LNG_OFF = "OFF";

	app.Checkbox = function($checkbox, onChange) {

		const api = this,
			$bg  = createElement("span", CLS_BG, $checkbox.parentNode),
			$bar = createElement("span", CLS_BAR, $bg);
		let savedState = $checkbox.checked;

		function updateState() {
			const checked = $checkbox.checked;

			$bg.setAttribute("checked", checked);
			$bar.innerText = checked ? LNG_ON : LNG_OFF;

			savedState !== checked && onChange(checked, $checkbox, api);
			savedState = checked;
		}

		function onMouseDown() {
			$checkbox.checked = !$checkbox.checked;
			updateState();
		}

		api.$checkbox = $checkbox;

		api.getState = function() {
			return $checkbox.checked;
		};

		api.setState = function(value) {
			$checkbox.checked = !!value;
			updateState();
		};

		app.on($bg, "mousedown", onMouseDown);

		$checkbox.style.display = "none";
		updateState();
	}

})(window.reedy);
