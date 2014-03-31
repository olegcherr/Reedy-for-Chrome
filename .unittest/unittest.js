

var colors          = require('colors'),
	argv            = process.argv,
	
	tests = [
		'parser1',
		'parser2',
		'parser3',
		'parser4',
		'parser4-sentenceEnd',
		''
	];


colors.setTheme({
	OK: 'green',
	Fail: 'magenta',
	Grey: 'grey',
	Divide: 'white'
});


window = (function() {
	
	var settings = {
		fontSize: 4, // 1-7
		wpm: 200,
		autostart: false,
		darkTheme: false,
		transparentBg: false,
		vPosition: 4,
		focusMode: true,
		smartSlowing: true,
		entityAnalysis: true,
		emptySentenceEnd: true
	};
	
	return {
		fastReader: {
			get: function(key) {
				return settings[key];
			}
		}
	};
	
})();


tests.forEach(function(name) {
	name && require('./tests/'+name+'.js');
});
