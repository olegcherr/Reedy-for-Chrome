

exports = (function() {
	
	function test(raw, expected) {
		var parser = new window.fastReader.Parser(raw);
		parser.parse();
		var hephenated = parser.nextWord().toHyphenated();
		assert.equalArray(hephenated, expected, raw);
	}
	
	
	var assert = require('../assert.js');
	
	require('../../js/content/Parser.js');
	
	
	assert.profile('hypens');
	
	test('снег',                                            ['снег']);
	
	test('Научно-Этического',                               ['Научно','Этического']);
	test('гуманитарно-этической',                           ['гуманитарно','этической']);
	test('Сказал-толкнул-упал-поднялся-разошлись',          ['Сказал','толкнул','упал','поднялся','разошлись']);
	
	test('speed_reading',                                   ['speed','reading']);
	test('Сказал_толкнул_упал_поднялся_разошлись',          ['Сказал','толкнул','упал','поднялся','разошлись']);
	
	test('семидесятимиллионная',                            ['семидес','ятимилл','ионная']);
	
	return assert.profileEnd();
	
})();
