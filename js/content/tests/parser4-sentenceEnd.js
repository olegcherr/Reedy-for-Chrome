

(function(app) {
	
	function getStyle(res) {
		return res ? STYLE_OK : STYLE_FAIL;
	}
	
	
	var STYLE_OK    = 'background:#cfc; color:#080;',
		STYLE_FAIL  = 'background:#fdd; color:#d00;',
		
		tests = [
			['изгиб или деталь. Пространство',              '0011'],
			['хорошего воспитания». Пока Лера',             '0101'],
			['Спасибо! - Опустив трубку, она',              '1001'],
			['Насчет Казанцевой... Неужели',                '011'],
			['тебя взял\n- Куда?',                          '011'],
			['вчера 29.03.2014 он',                         '001'],
			['ну Й.К.Л. Прильвиц понятно',                  '001'],
			['ну Й.К.Л. Прильвиц... понятно',               '011'],
			['ну Йитс У. Б. понятно теперь',                '0001'],
			['перевод A. Préchac’а). Сочетание',            '011'],
			
			[]
		];
	
	
	(function() {
		
		var test, args,
			tokens, actual,
			res, i, k;
		
		for (i = 0; i < tests.length; i++) {
			args = [];
			test = tests[i];
			
			if (!test.length) continue;
			
			tokens = app.parse4(test[0]);
//			console.log(tokens);
			
			actual = [];
			
			for (k = 0; k < tokens.length; k++) {
				actual += (+tokens[k].isSentenceEnd)+'';
			}
			
			res = test[1] === actual;
			
			console.log('%c<'+(res?' OK ':'Fail')+'>%c '+test[0].replace(/\n/gm,'\\n')+' >>> %c'+actual+'%c', getStyle(res), '', getStyle(res), '');
		}
		
	})
//	();
	
	
	
})(window.fastReader);
