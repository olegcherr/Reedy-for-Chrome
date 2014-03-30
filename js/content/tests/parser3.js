

(function(app) {
	
	function getStyle(res) {
		return res ? STYLE_OK : STYLE_FAIL;
	}
	
	
	var STYLE_OK    = 'background:#cfc; color:#080;',
		STYLE_FAIL  = 'background:#fdd; color:#d00;',
		
		tests = [
			['снег, у входа – елка.',                       ['снег',',','у','входа','–','елка','.']],
			['Глава 1 Глава 1.1 Команда А',                 ['Глава 1','Глава 1.1','Команда А']],
			
			['перевод A. Préchac’а). Сочетание',            ['перевод','A. Préchac’а',')','.','Сочетание']],
			['ну У. Б. Йитс понятно теперь',                ['ну','У. Б. Йитс','понятно','теперь']],
			['ну У. Б. Йитс У. понятно теперь',                ['ну','У. Б. Йитс','У','.','понятно','теперь']],
			['ну Й.К.Л. Прильвиц... понятно',               ['ну','Й.К.Л. Прильвиц','...','понятно']],
			
			['перевод Préchac’а A.). Сочетание',            ['перевод','Préchac’а A.',')','.','Сочетание']],
			['ну Йитс У. Б. понятно теперь',                ['ну','Йитс У. Б.','понятно','теперь']],
			['ну Прильвиц Й.К.Л... понятно',                ['ну','Прильвиц Й.К.Л','...','понятно']],
			['кричал:\n- Она',                              ['кричал',':','-','Она']],
			
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
			
			actualTokens = app.parse3(test[0]);
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
