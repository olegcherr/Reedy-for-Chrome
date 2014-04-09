

exports = (function() {
	
	function test(raw, expected) {
		assert.equal(window.fastReader.calcPivotPoint(raw), expected, raw);
	}
	
	
	var assert = require('../assert.js');
	
	
	assert.profile('hypens');
	
	test('1',               0);
	test('Ну',              1);
	test('как',             1);
	test('дела',            1);
	test('слова',           1);
	test('первых',          2);
	test('правило',         2);
	test('контекст',        2);
	test('наложения',       2);
	
	test('- Ну',            2);
	test('- 14',            2);
	test('1.',              0);
	test('ым), -',          1);
	test('25-ти',           1);
	test('25-ти.',          1);
	
	return assert.profileEnd();
	
})();
