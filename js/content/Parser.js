

(function(app) {
	
	function splitWordIfNeeded(str) {
		var dashIndex = str.indexOf("-"), slashIndex = str.indexOf("/"), uscoreIndex = str.indexOf("_");
		if (str.length > 13 || str.length > 9 && (dashIndex > -1 || uscoreIndex > -1 || slashIndex > -1)) {
			var index = dashIndex > -1
					? dashIndex // a dash is more important
					: slashIndex > -1 ? slashIndex : uscoreIndex,
				res = [];
			
			if (index > 0 && index < str.length - 1) {
				res.push(str.substr(0, index));
				res.push(str.substr(index + 1));
				return app.flatten(res.map(splitWordIfNeeded));
			}
			
			var parts = Math.ceil(str.length / 8),
				charCount = Math.ceil(str.length / parts);
			
			while (parts--) {
				res.push(str.substr(0, charCount));
				str = str.substr(charCount);
			}
			
			return res;
		}
		
		return [str];
	}
	
	
	function isUpperLetter(char) {
		return char.toLowerCase() !== char;
	}
	
	function isLowerLetter(char) {
		return char.toUpperCase() !== char;
	}
	
	function isLetter(char) {
		return isLowerLetter(char) || isUpperLetter(char);
	}
	
	function hasLetters(str) {
		return str.toUpperCase() !== str.toLowerCase();
	}
	
	function isDigits(str) {
		return /^\d+$/.test(str);
	}
	
	function hasDigits(str) {
		return /\d/.test(str);
	}
	
	function isSentenceEnd(str) {
		var m = REX_SENTENCE_END.exec(str);
		return m && !hasLetters(m[1]) && !hasDigits(m[1]);
	}
	
	
	function has(elem, array) {
		return array.indexOf(elem) > -1;
	}
	
	function only(expect, actual) { // TODO: make as in Kotlin
		for (var i = 0; i < actual.length; i++) {
			if (expect.indexOf(actual[i]) < 0) return false;
		}
		return !!actual.length;
	}
	
	
	function getCharType(char) {
		return CHAR_MAP[char] || CHAR_COMMON;
	}
	
	
	function stateMachine(tokens, patterns) {
		var data = [],
			stack_pat_check = [], pat_check, lastCheck,
			token1, token2 = new Token(),
			hasNotFalse, len, tokenStr, stackStr, index, chk, i = 0, k;
		
		while (true) {
			token1 = tokens[i];
			pat_check = [];
			hasNotFalse = false;
			
			if (token1) {
				token2.push(token1);
				tokenStr = token1.toString();
				stackStr = token2.toString();
				index = token2.length-1;
				
				lastCheck = stack_pat_check[stack_pat_check.length-1];
				for (k = 0; k < patterns.length; k++) {
					if (!lastCheck || lastCheck[k] !== RES_FALSE) {
						chk = patterns[k](index, token1, tokenStr, token2, stackStr);
						if (chk != RES_FALSE)
							hasNotFalse = true;
						
						pat_check.push(chk);
					}
					else {
						pat_check.push(RES_FALSE);
					}
				}
				
				stack_pat_check.push(pat_check);
			}
			
			
			if (hasNotFalse) {
				i++;
			}
			else {
				if (stack_pat_check.length > 1) {
					if (token1) {
						stack_pat_check.pop();
						token2.pop();
					}
					
					while ((len = stack_pat_check.length) > 1 && stack_pat_check[len-1].indexOf(RES_MATCH) < 0) {
						stack_pat_check.pop();
						token2.pop();
						i--;
					}
				}
				else {
					i++;
				}
				
				data.push(token2);
				stack_pat_check = [];
				token2 = new Token();
				
				if (!tokens[i]) break;
			}
		}
		
		return data;
	}
	
	
	function PlainToken() {
		var api = this;
		
		api.value = '';
		api.type = null;
		
		api.startIndex =
		api.endIndex = 0;
		
		api.hasSpaceAfter =
		api.hasSpaceBefore =
		api.hasNewLineAfter =
		api.hasNewLineBefore = false;
		
		api.isSentenceEnd = false;
	}
	
	PlainToken.prototype.getMask = function() {
		var api = this;
		return [+api.hasSpaceBefore, +api.hasSpaceAfter, +api.hasNewLineBefore, +api.hasNewLineAfter].join('');
	}
	
	PlainToken.prototype.checkMask = function(mask) {
		var m = this.getMask(), i;
		
		for (i = 0; i < m.length; i++) {
			if (mask[i] !== '.' && mask[i] !== m[i]) {
				return false;
			}
		}
		
		return true;
	}
	
	PlainToken.prototype.getComplexity = function() {
		var api = this;
		
		if (!api._cache_complexity) {
			var len = api.value.length,
				res = 1;
			
			if (len < 4 || len > 7) {
				res += .5;
				
				if (len > 10)
					res += .5;
			}
			
			return api._cache_complexity = res;
		}
		
		return api._cache_complexity;
	}
	
	PlainToken.prototype.toString = function() {
		return this.value;
	}
	
	PlainToken.prototype.toHyphenated = function() {
		return splitWordIfNeeded(this.toString());
	}
	
	PlainToken.prototype.destroy = function() {
		this.value = this.type = null;
	}
	
	
	function Token() {
		var api = this;
		
		api.length = 0;
		api.childs = [];
		
		api.total = 0;
		
		api.startIndex =
		api.endIndex = 0;
		api.textLength = 0;
		
		api.hasSpaceAfter =
		api.hasSpaceBefore =
		api.hasNewLineAfter =
		api.hasNewLineBefore = false;
		
		api.isSentenceEnd = false;
	}
	
	Token.prototype.get = function(index) {
		return this.childs[index];
	}
	
	/**
	 * Token.prototype.set = function(index, child) {
		this.childs[index] = child;
		this.update();
		return child;
	}*/
	
	Token.prototype.push = function(child) {
		this.childs.push(child);
		this.update();
		return this.length;
	}
	
	Token.prototype.pop = function() {
		var res = this.childs.pop();
		this.update();
		return res;
	}
	
	Token.prototype.update = function() {
		var api = this;
		
		api.length = api.childs.length;
		
		var first = api.childs[0],
			last = api.childs[api.length-1],
			child, i;
		
		api.startIndex = first ? first.startIndex : 0;
		api.hasSpaceBefore = first ? first.hasSpaceBefore : false;
		api.hasNewLineBefore = first ? first.hasNewLineBefore : false;
		
		api.endIndex = last ? last.endIndex : 0;
		api.hasSpaceAfter = last ? last.hasSpaceAfter : false;
		api.hasNewLineAfter = last ? last.hasNewLineAfter : false;
		
		api.textLength = api.endIndex - api.startIndex;
		
		api.total = 0;
		for (i = 0; i < api.length; i++) {
			child = api.childs[i];
			api.total += child.value ? 1 : child.total;
		}
		
		api._cache_complexity = null;
	}
	
	
	Token.prototype.getMask = function() {
		var api = this;
		return [+api.hasSpaceBefore, +api.hasSpaceAfter, +api.hasNewLineBefore, +api.hasNewLineAfter].join('');
	}
	
	Token.prototype.checkMask = function(mask) {
		var m = this.getMask(), i;
		
		for (i = 0; i < m.length; i++) {
			if (mask[i] !== '.' && mask[i] !== m[i]) {
				return false;
			}
		}
		
		return true;
	}
	
	Token.prototype.checkChildren = function(callback) {
		for (var i = 0; i < this.length; i++) {
			if (callback(i, this.childs[i]) === false) return false;
		}
		return true;
	}
	
	
	Token.prototype.getTypes = function() {
		var res = [], types, child, i, k;
		
		for (i = 0; i < this.length; i++) {
			child = this.childs[i];
			if (child.getTypes) {
				types = child.getTypes();
				for (k = 0; k < types.length; k++) {
					res.indexOf(types[k]) < 0 && res.push(types[k]);
				}
			}
			else {
				res.indexOf(child.type) < 0 && res.push(child.type);
			}
			
		}
		
		return res;
	}
	
	Token.prototype.checkContents = function(types) {
		var t = this.getTypes(), i;
		
		for (i = 0; i < t.length; i++) {
			if (types.indexOf(t[i]) < 0) {
				return false;
			}
		}
		
		return !!t.length;
	}
	
	Token.prototype.getComplexity = function() {
		var api = this;
		
		if (!api._cache_complexity) {
			var types = api.getTypes(),
				res = 1;
			
			if (api.isSentenceEnd || api.total > 1 || types[0] !== CHAR_COMMON || isDigits(api.toString()) || api.toHyphenated().length > 1)
				res += 1.1;
			
			if (api.textLength < 4 || api.textLength > 7) {
				res += .3;
				
				if (api.textLength > 10 && api.textLength < 14)
					res += .4;
			}
			
			return api._cache_complexity = res;
		}
		
		return api._cache_complexity;
	}
	
	
	Token.prototype.toString = function() {
		var res = '', child, i;
		
		for (i = 0; i < this.length; i++) {
			child = this.childs[i];
			res += i ? (child.hasNewLineBefore ? '\n' : '')+(child.hasSpaceBefore ? ' ' : '') : '';
			res += child.toString();
		}
		
		return res;
	}
	
	Token.prototype.toHyphenated = function() {
		return splitWordIfNeeded(this.toString());
	}
	
	Token.prototype.destroy = function() {
		var api = this;
		
		for (var i = 0; i < api.length; i++) {
			api.childs[i].destroy();
			api.childs[i] = null;
		}
		api.childs = null;
	}
	
	
	
	/**
	 * Notes
	 * Doesn't match english single quotes (‘...’) because the closing quote equals to the apostrophe char.
	 */
	var REX_SENTENCE_END = /(?:\.|…|!|\?|;)([^.…!?;]*)$/,
		REX_PHONE = /^\+?(?:\d+ ?)?(?:\(\d+(?: \d+)?\)|\d+)? ?[\d\-]+$/,
		
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
		CHAR_BULLET     = 12,
		CHAR_COMMON     = 13,
		
		CHAR_MAP        = {
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
			'+': CHAR_PLUS,
			'•': CHAR_BULLET,
			'∙': CHAR_BULLET,
			'◦': CHAR_BULLET,
			'‣': CHAR_BULLET
		},
		
		CHARS_INTO_WORD = [CHAR_DASH, CHAR_DOT],
		
		RES_FALSE       = 0,
		RES_NEED_MORE   = 1,
		RES_MATCH       = 2,
		
		patterns_level2 = [
			// `что-то` | `Préchac’а` | `30-е` | `15-20` | `S.T.A.L.K.E.R`
			function(i, token, tokenStr) {
				if (!i) return token.type === CHAR_COMMON && !token.hasSpaceAfter && !token.hasNewLineAfter ? RES_NEED_MORE : RES_FALSE;
				if (i%2) return tokenStr.length === 1 && has(token.type, CHARS_INTO_WORD) && token.checkMask('0000') ? RES_NEED_MORE : RES_FALSE;
				return token.type === CHAR_COMMON && !token.hasSpaceBefore && !token.hasNewLineBefore ? RES_MATCH : RES_FALSE;
			},
			
			// `-30°C` | `+30*2` | `+100500`
			function(i, token, tokenStr) {
				if (!i) return tokenStr.length === 1 && has(token.type, [CHAR_PLUS, CHAR_DASH]) && !token.hasSpaceAfter && !token.hasNewLineAfter ? RES_NEED_MORE : RES_FALSE;
				return i === 1 && token.type === CHAR_COMMON && isDigits(tokenStr[0]) ? RES_MATCH : RES_FALSE;
			},
			
			// `+7 (985) 970-45-45` | `7 985 970-45-45` | `7(985)970-45-45` | `(815 2) 400600` | `+850 (2) 3813031`
			function(i, token, tokenStr, stack, stackStr) {
				if (!i) return token.type === CHAR_PLUS || isDigits(tokenStr) ? RES_NEED_MORE : RES_FALSE;
				if (stackStr.length > 7 && REX_PHONE.test(stackStr)) return RES_MATCH; // rex cannot be extracted from the if
				return isDigits(tokenStr) || tokenStr === '(' || tokenStr === ')' ? RES_NEED_MORE : RES_FALSE;
			},
			
			// https://chrome.google.com/webstore/detail/reedy/ihbdojmggkmjbhfflnchljfkgdhokffj
			// olegcherr@yandex.ru
			function(i, token, tokenStr, stack, stackStr) {
				if (stackStr.length < 5) return RES_NEED_MORE;
				if (!/^[\w/.:@?&#%]+$/.test(stackStr)) return RES_FALSE;
				
				var host, regexp;
				
				host = '(' + '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z]{2,6}' + '|' + '(?:\\d{1,3}\\.){3}\\d{1,3}' + ')';
				
				regexp = '^'
					+ '(?:((?:ht|f)tps?)://)?'			// Scheme
					+ '(?:([^:@]+)(?::([^:@]+))?@)?'	// User information
					+ host								// Host
					+ '(?::(\\d{1,5}))?'				// Port
					+ '(/[^\\s?#]*)?'					// Path
					+ '(?:\\?([^\\s#]*))?'				// Get variables
					+ '(?:#([^\\s]*))?'					// Anchor (hash)
				+ '$';
				
				return (new RegExp(regexp, 'i')).test(stackStr)
					? RES_MATCH
					: RES_NEED_MORE;
			}
		],
		
		patterns_level3 = [
			// `A. Préchac’а` | `У. Б. Йитс`
			function(i, token, tokenStr) {
				if (i%2) return tokenStr === '.' && token.hasSpaceAfter && !token.hasSpaceBefore ? RES_NEED_MORE : RES_FALSE;
				if (tokenStr.length === 1) return !token.hasSpaceAfter && !token.hasNewLineAfter && isUpperLetter(tokenStr) ? RES_NEED_MORE : RES_FALSE;
				return i > 1 && isUpperLetter(tokenStr[0]) ? RES_MATCH : RES_FALSE;
			},
			
			// `Й.К. Прильвиц` | `Й.К.Л. Прильвиц`
			function(i, token, tokenStr) {
				if (!i)
					return token.length > 2 && token.checkChildren(function(i, tkn) {
						var str = tkn.toString();
						return i%2 ? str === '.' : isUpperLetter(str);
					}) ? RES_NEED_MORE : RES_FALSE;
				
				if (i === 1) return token.hasSpaceAfter && token.toString() === '.' ? RES_NEED_MORE : RES_MATCH;
				
				return tokenStr.length > 1 && isUpperLetter(tokenStr[0]) ? RES_MATCH : RES_FALSE;
			},
			
			// `Préchac’а A.` | `Йитс У. Б.` | `Прильвиц Й.К.Л.` | `Прильвиц Й.К.Л`
			function(i, token, tokenStr) {
				if (!i)
					return token.hasSpaceAfter
						&& isUpperLetter(tokenStr[0])
						&& only([CHAR_DASH, CHAR_COMMON], token.getTypes())
					? RES_NEED_MORE : RES_FALSE;
				
				if (i%2) {
					if (tokenStr.length === 1) return isUpperLetter(tokenStr) ? RES_NEED_MORE : RES_FALSE;
					return token.total > 2 && token.checkChildren(function(i, tkn) {
						var str = tkn.toString();
						return i%2 ? str === '.' : isUpperLetter(str);
					}) ? RES_MATCH : RES_FALSE;
				}
				
				return tokenStr === '.' ? RES_MATCH : RES_FALSE;
			}
			
			// `25 марта` | `2014 года`
//			function(i, token, tokenStr) {
//				if (!i) return (token.hasSpaceBefore || token.hasNewLineBefore) && token.hasSpaceAfter && isDigits(tokenStr) ? RES_NEED_MORE : RES_FALSE;
//				if (i === 1 && isLetter(tokenStr[0])) return RES_MATCH;
//				return RES_FALSE;
//			}
		];
	
	
	app.Token = Token;
	
	app.PlainToken = PlainToken;
	
	
	app.parse1 = function(raw) {
		var char, prevChar,
			isSpace, isNewLine,
			charType, prevType,
			data = [], token, i;
		
		for (i = 0; i <= raw.length; i++) {
			prevChar = char;
			char = raw[i];
			
			charType = char && getCharType(char);
			
			isSpace = char === ' ';
			isNewLine = char === '\n';
			
			if (isSpace || isNewLine || charType !== prevType || !prevType || !char) {
				prevType = null;
				
				if (token) {
					token.endIndex = i;
					token.hasSpaceAfter = isSpace;
					token.hasNewLineAfter = isNewLine || i === raw.length;
					data.push(token);
					token = null;
				}
				
				if (!isSpace && !isNewLine && char) {
					token = new PlainToken();
					token.value = char;
					token.type = charType;
					token.startIndex = i;
					token.hasSpaceBefore = prevChar === ' ';
					token.hasNewLineBefore = !i || prevChar === '\n';
					
					prevType = charType;
				}
			}
			else {
				token.value += char;
			}
		}
		
		return data;
	}
	
	app.parse2 = function(raw) {
		return stateMachine(app.parse1(raw), patterns_level2);
	}
	
	app.parse3 = function(raw) {
		return stateMachine(app.parse2(raw), patterns_level3);
	}
	
	app.parse4 = function(raw) {
		
		function create() {
			if (token4 && token4.length && data[data.length-1] !== token4) {
				data.push(token4);
			}
			
			token4 = new Token();
			token4.push(token3);
			data.push(token4);
		}
		
		function push() {
			token4
				? token4.push(token3)
				: create();
		}
		
		
		var tokens3 = app.parse3(raw),
			token3, types, type,
			nextToken3, nextTypes, nextType,
			prevToken3, prevTypes, prevType,
			hasBreakBefore, hasBreakAfter,
			token4, data = [], i;
		
		for (i = 0; i < tokens3.length; i++) {
			prevToken3 = token3;
			prevTypes = types;
			prevType = type;
			
			token3 = nextToken3 || tokens3[i];
			types = nextTypes || token3.getTypes();
			type = nextType || types[0];
			
			nextToken3 = tokens3[i+1];
			nextTypes = nextToken3 && nextToken3.getTypes();
			nextType = nextTypes && nextTypes[0];
			
			hasBreakBefore = token3.hasSpaceBefore || token3.hasNewLineBefore;
			hasBreakAfter = token3.hasSpaceAfter || token3.hasNewLineAfter;
			
			if (types.length > 1 || type === CHAR_COMMON) {
				hasBreakBefore && (!token4 || token4.total > 1 || token4.getTypes()[0] === CHAR_COMMON)
					? create()
					: push();
				
				// any common char should reset the flag
				token4.isSentenceEnd = false;
			}
			else if (has(type, [CHAR_DASH, CHAR_DOT]) && !has(prevType, [CHAR_DASH, CHAR_DOT]) && !token3.hasNewLineBefore && (hasBreakAfter || nextType !== CHAR_COMMON)) {
				push();
			}
			else {
				hasBreakBefore && !token3.hasNewLineAfter
					? create()
					: push();
			}
			
			if (token3.hasNewLineAfter || types.length === 1 && has(type, [CHAR_DOT, CHAR_SEMICOLON, CHAR_MARK])) {
				token4.isSentenceEnd = true;
			}
		}
		
		return data;
	}
	
	
	app.advancedParser = function(raw) {
		var timeStart = new Date(),
			res = app.parse4(raw);
		
		app.event('Parsing time', 'Advanced', app.roundExp(new Date() - timeStart));
		
		return res;
	}
	
	app.simpleParser = function(raw) {
		var timeStart = new Date(),
			paragraphs = raw.split('\n'),
			data = [], index = 0,
			words, token, i, k;
		
		for (i = 0; i < paragraphs.length; i++) {
			i && index++; // nl
			
			if (paragraphs[i].length) {
				words = paragraphs[i].split(' ');
				
				for (k = 0; k < words.length; k++) {
					k && index++; // space
					
					if (words[k].length) { // unnecessary but recommended check
						token = new PlainToken();
						
						token.value = words[k];
						token.type = CHAR_COMMON;
						
						token.startIndex = index;
						token.endIndex = index + token.value.length;
						
						token.isSentenceEnd = k >= words.length-1 || isSentenceEnd(token.value);
						
						data.push(token);
						
						index = token.endIndex;
					}
				}
			}
		}
		
		app.event('Parsing time', 'Simple', app.roundExp(new Date() - timeStart));
		
		return data;
	}
	
	
	app.calcPivotPoint = function(str) {
		var len = str.length,
			point = 4, char;
		
		if (len < 2)  point = 0;
		else if (len < 6)  point = 1;
		else if (len < 10) point = 2;
		else if (len < 14) point = 3;
		
		char = str[point];
		
		if (!(isLetter(char) || isDigits(char))) {
			if ((char = str[point-1]) && (isLetter(char) || isDigits(char))) {
				point--;
			}
			else if ((char = str[point+1]) && (isLetter(char) || isDigits(char))) {
				point++;
			}
		}
		
		return point;
	}
	
	
	// http://forums.mozillazine.org/viewtopic.php?f=25&t=834075
})(window.reedy);
