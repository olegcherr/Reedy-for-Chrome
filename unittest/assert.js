

var DIV = ' | ',
	result = true;

function c(res) {
	return res ? 'OK' : 'Fail';
}

function status(res) {
	return '<'.Divide+(res?' OK ':'Fail')[c(res)]+'> '.Divide;
}

function cleanUp(str) {
	return str && str.replace(/\n/g, '\\n').replace(/•/g, '∙');
}

function log(res, actual, expected, message) {
	var msg = status(res);
	
	actual = cleanUp(actual);
	expected = cleanUp(expected);
	message = cleanUp(message);
	
	if (res) {
		msg += (message || actual).OK;
	}
	else {
		message && (msg += message[c(res)]);
		msg += '\nExpect '.Grey+expected.OK;
		msg += '\nActual '.Grey+actual.Fail;
	}
	
	console.log(msg[c(res)]);
}


exports.profile = function(name) {
	result = true;
	console.log(('===================================================================== '+name).cyan);
}

exports.profileEnd = function() {
	console.log(('--------------------------------------------------------------------- '+(result ? 'All tests passed' : 'There are some errors') + '\n').cyan);
	return result;
}


exports.equal = function(actual, expected, message) {
	var res = actual === expected;
	res || (result = false);
	log(res, actual.toString(), expected.toString(), message != null && message.toString());
};

exports.equalArray = function(actual, expected, message) {
	var res = actual.toString() === expected.toString(),
		strActual = '', strExpect = '', _c_ = c(res), msg, i;
	
	for (i = 0; i < actual.length; i++) {
		i && (strActual += DIV.Divide);
		strActual += actual[i].toString()[c(i in expected && expected[i] === actual[i])];
	}
	
	for (i = 0; i < expected.length; i++) {
		i && (strExpect += DIV.Divide);
		strExpect += expected[i].toString().yellow;
	}
	
	strActual = cleanUp(strActual);
	strExpect = cleanUp(strExpect);
	message = cleanUp(message);
	
	msg = (status(res)+(!res && message != null ? message[_c_] : ''));
	
	if (res) {
		msg += strActual;
	}
	else {
		msg += '\nExpect '.Grey + strExpect;
		msg += '\nActual '.Grey + strActual;
		msg += '\n';
	}
	
	res || (result = false);
	
	console.log(msg);
};
