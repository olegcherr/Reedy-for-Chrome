

(function(app) {
	
	function getStyle(res) {
		return res ? STYLE_OK : STYLE_FAIL;
	}
	
	function getStyleAttr(res) {
		return res ? STYLE_ATTRS : STYLE_FAIL;
	}
	
	
	var STYLE_OK    = 'background:#cfc; color:#080;',
		STYLE_FAIL  = 'background:#fdd; color:#d00;',
		STYLE_ATTRS = 'background:#bdf; color:#358;',
		
		tests = [
			['снег, у входа – елка.',                       ['снег|0010',',|0100','у|1100','входа|1100','–|1100','елка|1000','.|0001']],
			['Ах! как..... это я удачно…',                  ['Ах|0010','!|0100','как|1000','.....|0100','это|1100','я|1100','удачно|1000','…|0001']],
			['Ты «уходишь» к ней?! Отвечай!!',              ['Ты|0110','«|1000','уходишь|0000','»|0100','к|1100','ней|1000','?!|0100','Отвечай|1000','!!|0001']],
			['ни при чем.\n\nГлава 1\nКрасная Пресня',      ['ни|0110','при|1100','чем|1000','.|0001','Глава|0110','1|1001','Красная|0110','Пресня|1001']],
			['произошло что-то "необычное". Однажды,',        ['произошло|0110','что|1000','-|0000','то|0100','"|1000','необычное|0000','"|0000','.|0100','Однажды|1000',',|0001']],
			['перевод A. Préchac’а). Сочетание',            ['перевод|0110','A|1000','.|0100','Préchac|1000','’|0000','а|0000',')|0000','.|0100','Сочетание|1001']],
			['http://www.yandex.ru/',                       ['http|0010',':|0000','//|0000','www|0000','.|0000','yandex|0000','.|0000','ru|0000','/|0001']],
			['кричал:\n- Она',                              ['кричал|0010',':|0001','-|0110','Она|1001']],
			
			[]
		];
	
	
	(function() {
		
		var test, args,
			actualTokens, actualToken, actualAttrs,
			expectTokens, expectValue, expectAttrs,
			res, res_value, res_attrs,
			tokenValues, tokenAttrs, i, k;
		
		for (i = 0; i < tests.length; i++) {
			args = [];
			test = tests[i];
			
			if (!test.length) continue;
			
			actualTokens = app.parse1(test[0]);
//			console.log(actualTokens);
			
			expectTokens = test[1];
			tokenValues = [];
			tokenAttrs = [];
			res = true;
			
			for (k = 0; k < actualTokens.length; k++) {
				if (expectTokens[k]) {
					actualToken = actualTokens[k];
					actualAttrs = actualToken && actualToken.getMask();
					expectValue = expectTokens[k].slice(0,-5);
					expectAttrs = expectTokens[k].slice(-4);
					
					res_value = actualToken && actualToken.value === expectValue;
					res_attrs = actualToken && actualAttrs === expectAttrs;
				}
				else {
					res_value = res_attrs = false;
				}
				
				if (!res_value || !res_attrs) {
					res = false;
				}
				
				if (actualToken) {
					tokenValues.push(actualToken.value+'%c'+actualAttrs);
					args.push(getStyle(res_value), getStyleAttr(res_attrs), '');
				}
			}
			
			args.unshift(getStyle(res), '');
			
			console.log.apply(console, ['%c<'+(res ? ' OK ' : 'Fail')+'>%c '+test[0].replace(/\n/gm,'\\n')+' >>> %c'+tokenValues.join('%c, %c').replace(/\n/gm,'\\n')+'%c'].concat(args));
		}
		
	})
//	();
	
	
	
})(window.fastReader);
