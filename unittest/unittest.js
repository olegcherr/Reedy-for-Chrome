

var fs              = require('fs'),
	colors          = require('colors'),
	argv            = process.argv,
	test2run        = argv[2],
	
	tests           = fs.readdirSync('./tests'),
	
	noop = function(ret) {
		if (ret)
			return function() {
				return ret;
			};
	};


colors.setTheme({
	OK: 'green',
	Fail: 'magenta',
	Grey: 'grey',
	Divide: 'white'
});


window = {
	addEventListener: noop
};
document = {
	createElement: noop({}),
	querySelector: noop,
	querySelectorAll: noop
};
chrome = {
	extension: {
		connect: noop({
			onDisconnect: {addListener: noop}
		}),
		sendMessage: noop,
		onMessage: {addListener: noop}
	}
};


require('../js/application.js');
require('../js/content/Parser.js');
require('../js/content/Sequencer.js');
require('../js/content/View.js');
require('../js/content/Reader.js');
require('../js/content/ContentSelector.js');
require('../js/content/content.js');


tests.forEach(function(name) {
	name && (!test2run || test2run+'.js' === name) && require('./tests/'+name);
});
