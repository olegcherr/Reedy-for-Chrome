

exports = (function() {
	
	function test(raw, expected) {
		var parser = new window.fastReader.Parser(raw);
		parser.parse();
		var hephenated = parser.nextWord().toHyphenated();
		assert.equalArray(hephenated, expected, raw);
	}
	
	
	var assert = require('../assert.js');
	
	require('../../js/content/Parser.js');
	
	
	var Token = window.fastReader.Token,
		PlainToken = window.fastReader.PlainToken,
		token, token2, token3, token4, token5;
	
	assert.profile('token: total');
	
	/////////////////////////////////////////////////////
	
	token = new Token();
	assert.equal(token.total, 0);
	
	/////////////////////////////////////////////////////
	
	token = new Token();
	token.push(new Token());
	assert.equal(token.total, 0);
	
	/////////////////////////////////////////////////////
	
	token = new Token();
	token2 = new Token();
	token3 = new PlainToken();
	token3.value = 'yes';
	token2.push(token3);
	token.push(token2);
	assert.equal(token.total, 1);
	assert.equal(token2.total, 1);
	
	/////////////////////////////////////////////////////
	
	token = new Token();
	token2 = new Token();
	token3 = new PlainToken();
	token4 = new Token();
	token5 = new PlainToken();
	
	token3.value = 'yes';
	token5.value = 'yo';
	
	token4.push(token5);
	token2.push(token3);
	token2.push(token4);
	token.push(token2);
	
	assert.equal(token.total, 2);
	assert.equal(token2.total, 2);
	assert.equal(token4.total, 1);
	
	/////////////////////////////////////////////////////
	
	return assert.profileEnd();
	
})();
