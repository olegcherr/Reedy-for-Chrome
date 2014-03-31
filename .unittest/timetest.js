

var ITERATIONS = 1E5,
	TIME_LIMIT = 10000,
	TESTS_COUNT = 10;


//ITERATIONS = 1E6;
//var REX1 = /(\d+( \d+)(\d+)(.+)?)/,
//	REX2 = /(?:\d+(?: \d+)(?:\d+)(?:.+)?)/;
//function fn() {
//	REX1.test('7(985)970-45-45');
//	REX1.test('7(985)970-45-45');
//}

//function fn() {
//	if (true)
//		for (var i = 0; i < 1; i++) {
//			
//		}
//}





// ==============================================

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
	
	setTimeout(testNum < TESTS_COUNT ? go : done, 500);
}

function done() {
	var result = totalTime / TESTS_COUNT,
		mess = '-> ' + result + 'мс';
	console.log(mess);
}

setTimeout(go, 500);
