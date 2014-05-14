

exports = (function() {
	
	function check(raw, expected) {
		assert.equal(window.reedy.calcPivotPoint(raw), expected, expected+": "+raw);
	}
	
	
	var assert = require("../assert.js");
	
	
	assert.profile("hypens");
	
	check("1",              0);
	check("Ну",             1);
	check("как",            1);
	check("дела",           1);
	check("слова",          1);
	check("первых",         2);
	check("правило",        2);
	check("контекст",       2);
	check("наложения",      2);
	
	check("- Ну",           2);
	check("- 14",           2);
	check("1.",             0);
	check("ым), -",         1);
	check("25-ти",          1);
	check("25-ти.",         1);
	
	return assert.profileEnd();
	
})();
