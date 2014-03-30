

(function(app) {
	
	function getStyle(res) {
		return res ? STYLE_OK : STYLE_FAIL;
	}
	
	
	var STYLE_OK    = 'background:#cfc; color:#080;',
		STYLE_FAIL  = 'background:#fdd; color:#d00;',
		
		tests = [
			['снег, у входа – елка.',                       ['снег',',','у','входа','–','елка','.']],
			['произошло что-то необычное. Лента.ру,',        ['произошло','что-то','необычное','.','Лента.ру',',']],
			['произошло "что-то" необычное))) Однажды,',    ['произошло','"','что-то','"','необычное',')))','Однажды',',']],
			['перевод A. Préchac’а). Сочетание',            ['перевод','A','.','Préchac’а',')','.','Сочетание']],
			['Сказал-толкнул-упал-поднялся-разошлись.',     ['Сказал-толкнул-упал-поднялся-разошлись','.']],
			['http://www.yandex.ru/',                       ['http://www.yandex.ru/']],
			['olegcherr@yandex.ru',                         ['olegcherr@yandex.ru']],
			
			[]
		];
	
	
	(function() {
		
		var test, args,
			actualTokens, actualValue,
			expectTokens, expectValue,
			tokenValues, res, i, k;
		
		for (i = 0; i < tests.length; i++) {
			args = [];
			test = tests[i];
			
			if (!test.length) continue;
			
			actualTokens = app.parse2(test[0]);
//			console.log(actualTokens);
			
			expectTokens = test[1];
			tokenValues = [];
			res = true;
			
			for (k = 0; k < actualTokens.length; k++) {
				actualValue = actualTokens[k].toString();
				expectValue = expectTokens[k];
				
				res = actualValue === expectValue;
				
				tokenValues.push(actualValue);
				args.push(getStyle(res), '');
			}
			
			args.unshift(getStyle(res), '');
			
			console.log.apply(console, ['%c<'+(res ? ' OK ' : 'Fail')+'>%c '+test[0].replace(/\n/gm,'\\n')+' >>> %c'+tokenValues.join('%c, %c').replace(/\n/gm,'\\n')+'%c'].concat(args));
		}
		
	})
//	();
	
	
	
})(window.fastReader);
