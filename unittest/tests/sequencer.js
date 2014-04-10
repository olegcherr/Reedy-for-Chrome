

exports = (function() {
	
	function checkSequencer(sequencer, raw, data, index) {
		assert.equal(sequencer.index, index, '[Index] '+raw);
		assert.equal(sequencer.getTimeLeft(), getTimeLeft(data, index), '[Time left] '+raw);
	}
	
	function getTimeLeft(data, fromIndex) {
		for (var i = 0, res = 0; i < data.length; i++) {
			if (i > fromIndex) {
				res += data[i].getComplexity() * timing;
			}
		}
		return res;
	}
	
	
	function test(raw, indexes) {
		var data = parser(raw),
			sequencer = new Sequencer(raw, data), i = -1;
		
		assert.equal(sequencer.index, 0, '[Index] '+raw);
		assert.equal(sequencer.getTimeLeft(), getTimeLeft(data, 0), '[Time left] '+raw);
		
		sequencer.toNextToken();
		checkSequencer(sequencer, raw, data, indexes[++i]);
		
		sequencer.toLastToken();
		checkSequencer(sequencer, raw, data, indexes[++i]);
		
		sequencer.toFirstToken();
		checkSequencer(sequencer, raw, data, indexes[++i]);
	}
	
	function testSent(raw, indexes) {
		var data = parser(raw),
			sequencer = new Sequencer(raw, data), i = -1;
		
		sequencer.toNextSentence();
		checkSequencer(sequencer, raw, data, indexes[++i]);
		
		sequencer.toNextSentence();
		checkSequencer(sequencer, raw, data, indexes[++i]);
		
		sequencer.toPrevSentence();
		checkSequencer(sequencer, raw, data, indexes[++i]);
	}
	
	function testTokenAtIndex(raw) {
		var data = parser(raw),
			sequencer = new Sequencer(raw, data), i;
		
		for (i = 1; i < arguments.length; i++) {
			sequencer.toTokenAtIndex(arguments[i][0]);
			assert.equal(sequencer.index, arguments[i][1], i+': '+raw);
		}
	}
	
	
	var assert = require('../assert.js');
	
	
	var Sequencer = window.fastReader.Sequencer,
		parser = window.fastReader.parse4,
		wpm = 600, timing = 60000/wpm;
	
	window.fastReader.get = function(key) {
		return ({
			wpm: wpm,
			fontSize: 4,
			vPosition: 4,
			darkTheme: false,
			transparentBg: false,
			
			autostart: false,
			focusMode: true,
			gradualAccel: true,
			smartSlowing: true,
			
			entityAnalysis: true,
			hyphenation: true,
			emptySentenceEnd: true,
			
			progressBar: true,
			timeLeft: true
		})[key];
	}
	
	assert.profile('Sequencer');
	
	/////////////////////////////////////////////////////
	
	test('Hello',                                   [0, 0, 0]);
	test('just a word',                             [1, 2, 0]);
	test('Hello! How are you?',                     [1, 3, 0]);
	test('Hello! How are you?\n- I\'m fine!',       [1, 5, 0]);
	
	/////////////////////////////////////////////////////
	
	testSent('Hello',                               [0, 0, 0]);
	testSent('just a word',                         [2, 2, 0]);
	testSent('Hello! How are you?',                 [1, 3, 1]);
	testSent('Hello! How are you?\n- I\'m fine!',   [1, 4, 1]);
	testSent('Hello! How?\nFine!',                  [1, 2, 1]);
	
	/////////////////////////////////////////////////////
	
	testTokenAtIndex('Hello',                                   [0,0], [1,0], [10,0]);
	testTokenAtIndex('Hello! How are you?\n- I\'m fine!',       [0,0], [1,0], [6,0], [7,1], [21,4], [50,5]);
	
	/////////////////////////////////////////////////////
	
	return assert.profileEnd();
	
})();
