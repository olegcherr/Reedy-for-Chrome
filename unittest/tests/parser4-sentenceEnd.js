

exports = (function() {
	
	function test(raw, expected) {
		var tokens = window.reedy.parse4(raw),
			res = [], i;
		
		for (i = 0; i < tokens.length; i++) {
			res += (+tokens[i].isSentenceEnd)+'';
		}
		
		assert.equal(res, expected, raw);
	}
	
	
	var assert = require('../assert.js');
	
	
	assert.profile('parser4-sentenceEnd');
	
	test('изгиб или деталь. Пространство',                  '0011');
	test('хорошего воспитания». Пока Лера',                 '0101');
	test('Спасибо! - Опустив трубку, она',                  '1001');
	test('Насчет Казанцевой... Неужели',                    '011');
	test('тебя взял\n- Куда?',                              '011');
	test('вчера 29.03.2014 он',                             '001');
	test('ну Й.К.Л. Прильвиц понятно',                      '001');
	test('ну Й.К.Л. Прильвиц... понятно',                   '011');
	test('ну Йитс У. Б. понятно теперь',                    '0001');
	test('перевод A. Préchac’а). Сочетание',                '011');
	
	return assert.profileEnd();
	
})();
