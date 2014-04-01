

exports = (function() {
	
	var assert = require('../assert.js');
	
	require('../../js/content/Parser.js');
	
	
	var Token = window.fastReader.Token,
		PlainToken = window.fastReader.PlainToken,
		token, token2, token3, token4, token5;
	
	assert.profile('token: total');
	
	/////////////////////////////////////////////////////
	
	token = new Token();
	assert.equal(token.length, 0);
	assert.equal(token.total, 0);
	
	/////////////////////////////////////////////////////
	
	token = new Token();
	
	token.push(new Token());
	
	assert.equal(token.length, 1);
	assert.equal(token.total, 0);
	
	/////////////////////////////////////////////////////
	
	token = new Token();
	token2 = new Token();
	token3 = new PlainToken();
	token3.value = 'yes';
	
	token2.push(token3);
	token.push(token2);
	
	assert.equal(token.length, 1);
	assert.equal(token.total, 1);
	assert.equal(token2.total, 1);
	assert.equal(token2.total, 1);
	
	/////////////////////////////////////////////////////
	
	token = new Token();
	token2 = new Token();
	token3 = new PlainToken();
	token4 = new Token();
	token5 = new PlainToken();
	
	token3.value = 'yes';
	token3.type = 111;
	token5.value = '!';
	token5.type = 222;
	
	token4.push(token5);
	token2.push(token3);
	token2.push(token4);
	token.push(token2);
	
	assert.equal(token.length, 1);
	assert.equal(token.total, 2);
	assert.equal(token2.total, 2);
	assert.equal(token2.total, 2);
	assert.equal(token4.length, 1);
	assert.equal(token4.total, 1);
	
	assert.equalArray(token.getTypes(), [111,222]);
	assert.equalArray(token2.getTypes(), [111,222]);
	assert.equalArray(token4.getTypes(), [222]);
	
	assert.equal(token.toString(), 'yes!');
	
	/////////////////////////////////////////////////////
	
	return assert.profileEnd();
	
})();
