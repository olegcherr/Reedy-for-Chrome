

exports = (function() {
	
	function check(raw, expected) {
		var tokens = window.reedy.parse4(raw),
			res = [], i;
		
		for (i = 0; i < tokens.length; i++) {
			res += (+tokens[i].isSentenceEnd)+'';
		}
		
		assert.equal(res, expected, raw);
	}
	
	
	var assert = require("../assert.js");
	
	
	assert.profile("parser4-sentenceEnd");
	
	check("изгиб или деталь. Пространство",                 "0011");
	check("хорошего воспитания». Пока Лера",                "0101");
	check("Спасибо! - Опустив трубку, она",                 "1001");
	check("Насчет Казанцевой... Неужели",                   "011");
	check("тебя взял\n- Куда?",                             "011");
	check("вчера 29.03.2014 он",                            "001");
	check("ну Й.К.Л. Прильвиц понятно",                     "001");
	check("ну Й.К.Л. Прильвиц... понятно",                  "011");
	check("ну Йитс У. Б. понятно теперь",                   "0001");
	check("перевод A. Préchac’а). Сочетание",               "011");
	
	return assert.profileEnd();
	
})();
