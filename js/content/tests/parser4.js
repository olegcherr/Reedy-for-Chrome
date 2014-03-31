

(function(app) {
	
	function getStyle(res) {
		return res ? STYLE_OK : STYLE_FAIL;
	}
	
	
	var STYLE_OK    = 'background:#cfc; color:#080;',
		STYLE_FAIL  = 'background:#fdd; color:#d00;',
		
		tests = [
			['снег, у " входа - елка.',                     ['снег,','у','" входа -','елка.']],
			['перевод A. Préchac’а). Сочетание',            ['перевод','A. Préchac’а).','Сочетание']],
			['ну Й.К.Л. Прильвиц... понятно',               ['ну','Й.К.Л. Прильвиц...','понятно']],
			['сказал "ну, конечно ..." и ушёл',             ['сказал','"ну,','конечно ..."','и','ушёл']],
			['присутствующих, - …на двадцать',              ['присутствующих, -','…на','двадцать']],
			['(какой-то текст.)',                           ['(какой-то','текст.)']],
			['текст (...) текст',                           ['текст','(...)','текст']],
			['текст [...] текст',                           ['текст','[...]','текст']],
			['в 2001 (?) из',                               ['в','2001','(?)','из']],
			['с грустью (и болью?) сказал',                 ['с','грустью','(и','болью?)','сказал']],
			['говорят: "как собак".',                       ['говорят:','"как','собак".']],
			['из-за хутора )))',                            ['из-за','хутора )))']],
			['смайликов отсыпать? :)',                      ['смайликов','отсыпать?',':)']],
			['вот это да 0_о',                              ['вот','это','да','0_о']],
			['или так [^_^] вот !',                         ['или','так','[^_^]','вот !']],
			['22:22 29.03.2014',                            ['22:22','29.03.2014']],
			['- Прего![2]',                                 ['- Прего![2]']],
			['«Пресня Палас»',                              ['«Пресня','Палас»']],
			['«Пресня\nПалас»',                             ['«Пресня','Палас»']],
			['весьма\n"интересную"',                        ['весьма','"интересную"']],
			['весьма\n( интересную )',                      ['весьма','( интересную )']],
			['кричал:\n- Она',                              ['кричал:','- Она']],
			
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
			
			actualTokens = app.parse4(test[0]);
//			console.log(actualTokens);
			
			expectTokens = test[1];
			tokenValues = [];
			res = true;
			
			for (k = 0; k < actualTokens.length; k++) {
				actualValue = actualTokens[k].toString().trim();
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
