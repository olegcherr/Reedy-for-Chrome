

var ITERATIONS = 1e5,
	TIME_LIMIT = 10000,
	TESTS_COUNT = 10,
	fn = function() {};


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
		reedy: {
			get: function(key) {
				return settings[key];
			}
		}
	};
	
})();


/*ITERATIONS = 3e3;
TESTS_COUNT = 5;
require('../js/content/Parser.js');
var str = "Странный всё-таки праздник Восьмое марта, очень странный. Вроде бы должен быть радостным, солнечным, ведь на календаре первый весенний месяц и сама мысль о скором тепле туманит голову, но… Но не туманит, потому что трудно припомнить, когда в последний раз восьмого марта не было снега." +
	"\nA dynamical system is a concept in mathematics where a fixed rule describes the time dependence of a point in a geometrical space. Examples include the mathematical models that describe the swinging of a clock pendulum, the flow of water in a pipe, and the number of fish each springtime in a lake.";
fn = function() {
	window.reedy.parse4(str);
}*/

/*var str = 's/h.,h-df;`1%#@_+_@#%*()g[]g{g4}!?s df',
	REX = /^(\.|…)|(,)|(;)|(:)|(!|\?)|(\-|—)|(\(|\[|\{)|(\)|\]|\})|(«|»|‹|›|"|„|“|”)|(\/|\\)|(\+)|(.)$/,
	CHAR_DOT        = 1,
	CHAR_COMMA      = 2,
	CHAR_SEMICOLON  = 3,
	CHAR_COLON      = 4,
	CHAR_MARK       = 5,
	CHAR_DASH       = 6,
	CHAR_O_BRACKET  = 7,
	CHAR_C_BRACKET  = 8,
	CHAR_QUOTE      = 9,
	CHAR_SLASH      = 10,
	CHAR_PLUS       = 11,
	CHAR_COMMON     = 12,
	CHAR_TYPES      = [
		CHAR_DOT,
		CHAR_COMMA,
		CHAR_SEMICOLON,
		CHAR_COLON,
		CHAR_MARK,
		CHAR_DASH,
		CHAR_O_BRACKET,
		CHAR_C_BRACKET,
		CHAR_QUOTE,
		CHAR_SLASH,
		CHAR_PLUS,
		CHAR_COMMON
	],
	hashMap = {
		'.': CHAR_DOT,
		'…': CHAR_DOT,
		',': CHAR_COMMA,
		';': CHAR_SEMICOLON,
		':': CHAR_COLON,
		'!': CHAR_MARK,
		'?': CHAR_MARK,
		'-': CHAR_DASH,
		'—': CHAR_DASH,
		'(': CHAR_O_BRACKET,
		'[': CHAR_O_BRACKET,
		'{': CHAR_O_BRACKET,
		')': CHAR_C_BRACKET,
		']': CHAR_C_BRACKET,
		'}': CHAR_C_BRACKET,
		'«': CHAR_QUOTE,
		'»': CHAR_QUOTE,
		'‹': CHAR_QUOTE,
		'›': CHAR_QUOTE,
		'"': CHAR_QUOTE,
		'„': CHAR_QUOTE,
		'“': CHAR_QUOTE,
		'”': CHAR_QUOTE,
		'/': CHAR_SLASH,
		'\\': CHAR_SLASH,
		'+': CHAR_PLUS
	};

function useREX(char) {
	var m = REX.exec(char), i;
	
	for (i = 1; i < m.length; i++) {
		if (m[i] !== undefined) {
			return CHAR_TYPES[i-1];
		}
	}
	
	return CHAR_COMMON;
}

function useHash(char) {
	return hashMap[char] || CHAR_COMMON;
}

fn = function() {
	for (var i = 0, r; i < str.length; i++) {
		r = useHash(str[i]);
	}
}*/

/*ITERATIONS = 1E6;
var REX1 = /(\d+( \d+)(\d+)(.+)?)/,
	REX2 = /(?:\d+(?: \d+)(?:\d+)(?:.+)?)/;
fn = function() {
	REX1.test('7(985)970-45-45');
	REX1.test('7(985)970-45-45');
}*/

/*var arr = [1], len = arr.length, x;
fn = function() {
//	if (len)
		for (var i = 0; i < len; i++) {
			x = 1;
		}
}*/

/*ITERATIONS = 5e6;
var REX_HYPHEN = /[^^][_-][^$]/,
	str = 'солн-ечным', x = 0;
fn = function() {
//	var dashIndex = str.indexOf("-"), uscoreIndex = str.indexOf("_"),
//		idx = dashIndex > -1 ? dashIndex : uscoreIndex;
//	if (idx > 0 && idx < str.length - 1) {
//		x = idx;
//	}
	var m = REX_HYPHEN.exec(str);
	if (m !== null) {
		x = m.index+1;
	}
}*/

/*ITERATIONS = 1e7;
function norm(num, min, max) {
	return num > max
		? max
		: num < min ? min : num;
}
var num = 1, min = 0, max = 5, x;
fn = function() {
//	x = Math.max(Math.min(num, max), min);
	x = norm(num, min, max);
}*/
// TODO
/*ITERATIONS = 1e7;
var arr = [1,2,3,7,8,9,10,1,2,3,7,8,9,10,1,2,3,7,8,9,10,11,12,13,10,11,12,13,14], x;
fn = function() {
	for (var i = 0, len = arr.length; i < len; i++) {
		x = arr[i];
	}
}*/





;(function() {
	
	var totalTime = 0,
		testNum = 0;
	
	function go() {
		testNum || console.log('-> go');
		
		//////////////////////////////////////////////////////////////
		
		var timeStart = +(new Date()),
			time, i;
		
		for (i = 0; i < ITERATIONS && fn() !== false; i++) { }
		
		time = +(new Date()) - timeStart;
		
		//////////////////////////////////////////////////////////////
		
		if (!TIME_LIMIT || time <= TIME_LIMIT) {
			console.log(time + 'мс');
			totalTime += time;
			testNum++;
		}
		
		setTimeout(testNum < TESTS_COUNT ? go : done, 200);
	}
	
	function done() {
		var result = totalTime / TESTS_COUNT,
			mess = '-> ' + result + 'мс';
		console.log(mess);
	}
	
	setTimeout(go, 500);
	
})();
