

(function(app) {
	
	function cleanUpText(raw) {
		var sign = '~NL'+(+(new Date())+'').slice(-5)+'NL~';
		return raw
			.trim()
			.replace(/\n|\r/gm, sign)
			.replace(/\s+/g, ' ')
			.replace(new RegExp('\\s*'+sign+'\\s*', 'g'), sign)     // `      \n    `
			.replace(/ \- /g, ' — ')                                // replace minus with em dash
			.replace(/–|―/g, '—')                                   // there are 4 dash types. after the cleaning only 2 will remain: minus and em dash
			.replace(/[-|—]{2,}/g, '—')                             // `--` | `------`
			.replace(/\.{4,}/g, '...')                              // `.......`
			.replace(/([!?]{3})[!?]+/g, '$1')                       // `неужели!!!!!???!!?!?`
			.replace(/ ([([]+) /g, ' $1')                           // `сюжет ( видео`
			.replace(/ ([)\].!?;]+)( |$)/g, '$1$2')                 // `вставка ) отличный` | `конечно ...`
			.replace(new RegExp(sign, 'g'), '\n');
	}
	
	function cleanUpTextSimple(raw) {
		var sign = '~NL'+(+(new Date())+'').slice(-5)+'NL~';
		return raw
			.trim()
			.replace(/\n|\r/gm, sign)
			.replace(/\s+/g, ' ')
			.replace(new RegExp('\\s*'+sign+'\\s*', 'g'), sign)     // `      \n    `
			.replace(new RegExp(sign, 'g'), '\n');
	}
	
	
	function isUpperLetter(char) {
		return char.toLowerCase() !== char;
	}
	
	function isLowerLetter(char) {
		return char.toUpperCase() !== char;
	}
	
	function isLetter(char) {
		return isUpperLetter(char) || isLowerLetter(char);
	}
	
	function hasLetters(str) {
		return str.toUpperCase() !== str.toLowerCase();
	}
	
	function hasDigits(str) {
		return /\d/.test(str);
	}
	
	function onlyDigits(str) {
		return /^\d+$/.test(str);
	}
	
	
	function has(elem, array) {
		return array.indexOf(elem) > -1;
	}
	
	function only(expect, actual) {
		for (var i = 0; i < actual.length; i++) {
			if (expect.indexOf(actual[i]) < 0) return false;
		}
		return !!actual.length;
	}
	
	
	function getCharType(char) {
		// TODO: Попробовать хеши (или if-ы) вместо регулярки
		var m = REX_CHARS.exec(char), i;
		
		if (m)
			for (i = 1; i < m.length; i++) {
				if (m[i] !== undefined) {
					return CHAR_TYPES[i-1];
				}
			}
		
		return CHAR_COMMON;
	}
	
	
	function stateMachine(tokens, patterns) {
		var data = [],
			stack_pat_check = [], pat_check, lastCheck,
			token1, token2 = new Token(), len, tokenStr, stackStr, index, i = 0, k;
		
		while (true) {
			token1 = tokens[i];
			pat_check = [];
			
			if (token1) {
				token2.push(token1);
				tokenStr = token1.toString();
				stackStr = token2.toString();
				index = token2.length-1;
				
				lastCheck = stack_pat_check[stack_pat_check.length-1];
				for (k = 0; k < patterns.length; k++) {
					if (!lastCheck || lastCheck[k] !== RES_FALSE) {
						pat_check.push(patterns[k](index, token1, tokenStr, token2, stackStr));
					}
					else {
						pat_check.push(RES_FALSE);
					}
				}
				
				stack_pat_check.push(pat_check);
			}
			
			
			if (pat_check.indexOf(RES_MATCH) > -1 || pat_check.indexOf(RES_NEED_MORE) > -1) {
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
	
	
	function Token() {
		
		function update() {
			api.length = api._childs.length;
			
			var first = api._childs[0],
				last = api._childs[api.length-1];
			
			api.startIndex = first ? first.startIndex : 0;
			api.hasSpaceBefore = first ? first.hasSpaceBefore : false;
			api.hasNewLineBefore = first ? first.hasNewLineBefore : false;
			
			api.endIndex = last ? last.endIndex : 0;
			api.hasSpaceAfter = last ? last.hasSpaceAfter : false;
			api.hasNewLineAfter = last ? last.hasNewLineAfter : false;
			
			api.textLength = api.endIndex - api.startIndex;
			
			api.total = 0;
			for (var i = 0; i < api._childs.length; i++) {
				api.total += api._childs[i].total;
			}
		}
		
		
		var api = this, i;
		
		api.length = 0;
		api.total = 0;
		api._childs = [];
		
		api.value = '';
		api.type = null;
		
		api.startIndex =
		api.endIndex = 0;
		api.textLength = 0;
		
		api.hasSpaceAfter =
		api.hasSpaceBefore =
		api.hasNewLineAfter =
		api.hasNewLineBefore = false;
		
		
		api.get = function(index) {
			return api._childs[index];
		}
		
		api.set = function(index, child) {
			api._childs[index] = child;
			update();
			return child;
		}
		
		api.push = function(child) {
			api._childs.push(child);
			update();
			return api.length;
		}
		
		api.pop = function() {
			var res = api._childs.pop();
			update();
			return res;
		}
		
		
		api.getMask = function() {
			return [+api.hasSpaceBefore, +api.hasSpaceAfter, +api.hasNewLineBefore, +api.hasNewLineAfter].join('');;
		}
		
		api.checkMask = function(mask) {
			var m = api.getMask(), i;
			
			for (i = 0; i < m.length; i++) {
				if (mask[i] !== '.' && mask[i] !== m[i]) {
					return false;
				}
			}
			
			return true;
		}
		
		
		api.getTypes = function() {
			var res = [], types, i, k;
			
			if (api.type != null) {
				res.push(api.type);
			}
			
			for (i = 0; i < api._childs.length; i++) {
				types = api._childs[i].getTypes();
				for (k = 0; k < types.length; k++) {
					res.indexOf(types[k]) < 0 && res.push(types[k]);
				}
			}
			
			return res;
		}
		
		api.checkContents = function(types) {
			var t = api.getTypes(), i;
			
			for (i = 0; i < t.length; i++) {
				if (types.indexOf(t[i]) < 0) {
					return false;
				}
			}
			
			return !!t.length;
		}
		
		
		api.toString = function() {
			var len = api._childs.length;
			if (len) {
				for (var i = 0, res = '', child; i < len; i++) {
					child = api._childs[i];
					res += i ? (child.hasNewLineBefore ? '\n' : '')+(child.hasSpaceBefore ? ' ' : '') : '';
					res += child.toString();
				}
				return res;
			}
			
			return api.value;
		}
		
	}
	
	
	
	/**
	 * Notes
	 * Doesn't match english single quotes (‘...’) because the closing quote equals to the apostrophe char.
	 */
	var REX_CHARS = /^(\.|…)|(,)|(;)|(:)|(!|\?)|(\-|—)|(\(|\[|\{)|(\)|\]|\})|(«|»|‹|›|"|„|“|”)|(’|')|(\/|\\)|(.)$/,
		
		CHAR_DOT        = 1,
		CHAR_COMMA      = 2,
		CHAR_SEMICOLON  = 3,
		CHAR_COLON      = 4,
		CHAR_MARK       = 5,
		CHAR_DASH       = 6,
		CHAR_O_BRACKET  = 7,
		CHAR_C_BRACKET  = 8,
		CHAR_QUOTE      = 9,
		CHAR_APOSTR     = 10,
		CHAR_SLASH      = 11,
		CHAR_COMMON     = 12,
		
		CHAR_TYPES      = [ // the order matters!!!
			CHAR_DOT,
			CHAR_COMMA,
			CHAR_SEMICOLON,
			CHAR_COLON,
			CHAR_MARK,
			CHAR_DASH,
			CHAR_O_BRACKET,
			CHAR_C_BRACKET,
			CHAR_QUOTE,
			CHAR_APOSTR,
			CHAR_SLASH,
			CHAR_COMMON
		],
		
		CHARS_INTO_WORD = [CHAR_DASH, CHAR_DOT, CHAR_APOSTR],
		
		RES_FALSE       = 0,
		RES_NEED_MORE   = 1,
		RES_MATCH       = 2,
		
		patterns_level2 = [
			// `что-то` | `Préchac’а`
			function(i, token, tokenStr) {
				if (!i && isLowerLetter(tokenStr[tokenStr.length-1]) && token.checkMask('.0.0') && token.checkContents([CHAR_COMMON])) return RES_NEED_MORE;
				if (i%2 && tokenStr.length === 1 && token.checkMask('.0.0') && token.checkContents(CHARS_INTO_WORD)) return RES_NEED_MORE;
				if (i && !(i%2) && token.checkContents([CHAR_COMMON])) {
					if (token.checkMask('0.0.')) return RES_MATCH;
					if (token.checkMask('0000')) return RES_NEED_MORE;
				}
				return RES_FALSE;
			},
			
			// https://chrome.google.com/webstore/detail/fastreader/ihbdojmggkmjbhfflnchljfkgdhokffj
			// olegcherr@yandex.ru
			function(i, token, tokenStr, stack, stackStr) {
				stackStr = stackStr.trim();
				
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
					: /^[\w/.:@?#%]+$/i.test(stackStr) ? RES_NEED_MORE : RES_FALSE;
			}
		],
		
		patterns_level3 = [
			// `A. Préchac’а` | `У. Б. Йитс` | `Й.К.Л. Прильвиц`
			function(i, token, tokenStr, stack, stackStr) {
				
				if (!i && tokenStr.length === 1 && isUpperLetter(tokenStr) && token.checkMask('.0.0')) return RES_NEED_MORE;
				if (i === 1 && tokenStr === '.' && token.checkMask('0.0.')) return RES_NEED_MORE;
				
				if (i > 1) {
					if (tokenStr.length === 1 && (tokenStr === '.' || isUpperLetter(tokenStr))) return RES_NEED_MORE;
					if (tokenStr.length > 1 && isUpperLetter(tokenStr[0])) return RES_MATCH;
				}
				
				return RES_FALSE;
			},
			
			// `Команда А` | `Глава 1` | `Глава 1.1` | `Préchac’а A.` | `Йитс У. Б.` | `Прильвиц Й.К.Л.`
			function(i, token, tokenStr, stack, stackStr) {
				var types;
				
				if (
					!i
					&& isUpperLetter(tokenStr[0])
					&& token.checkMask('.1.0')
					&& (types = token.getTypes())
					&& (types.length === 1 || only(CHARS_INTO_WORD.concat(CHAR_COMMON), types))
				) return RES_NEED_MORE;
				
				if (i > 0 && i%2 && (tokenStr.length === 1 && isUpperLetter(tokenStr) || onlyDigits(tokenStr))) return RES_MATCH;
				if (i > 1 && !(i%2) && tokenStr === '.') return RES_MATCH;
				
				return RES_FALSE;
			}
		];
	
	
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
			
			if (!char || isSpace || isNewLine || !prevType || charType !== prevType) {
				prevType = null;
				
				if (token) {
					token.endIndex = i;
					token.hasSpaceAfter = isSpace;
					token.hasNewLineAfter = isNewLine || i === raw.length;
					data.push(token);
					token = null;
				}
				
				if (char && !isSpace && !isNewLine) {
					token = new Token();
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
		
		function create(createEmpty) {
			if (token4 && token4.length && data[data.length-1] !== token4) {
				data.push(token4);
			}
			
			token4 = new Token();
			
			if (!createEmpty) {
				token4.push(token3);
				data.push(token4);
			}
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
				hasBreakBefore && (!token4 || token4.length > 1 || token4.getTypes()[0] === CHAR_COMMON)
					? create()
					: push();
			}
			else if (has(type, [CHAR_DASH, CHAR_DOT]) && !has(prevType, [CHAR_DASH, CHAR_DOT]) && !token3.hasNewLineBefore && (hasBreakAfter || nextType !== CHAR_COMMON)) {
				push();
			}
			else {
				hasBreakBefore && !token3.hasNewLineAfter
					? create()
					: push();
			}
		}
		
		return data;
	}
	
	
	app.simpleParser = function(raw) {
		var paragraphs = raw.split('\n'),
			data = [], index = 0,
			words, wlen, token, i, k;
		
		for (i = 0; i < paragraphs.length; i++) {
			i && index++; // nl
			
			if (paragraphs[i].length) {
				words = paragraphs[i].split(' ');
				
				for (k = 0; k < words.length; k++) {
					k && index++; // space
					wlen = words[k].length;
					
					token = new Token();
					token.value = words[k];
					token.type = CHAR_COMMON;
					token.startIndex = index;
					token.endIndex = index+wlen;
					data.push(token);
					
					index = token.endIndex;
				}
			}
		}
		
		return data;
	}
	
	
	app.Parser = function(raw) {
		
		function isSentenceEnd(word) {
			if (word.hasNewLineAfter) return true;
			
			var m = /(?:\.|…|!|\?|;)([^.…!?;]*)$/.exec(word.toString());
			return m && !hasLetters(m[1]) && !hasDigits(m[1]);
		}
		
		
		var api = this,
			data = [],
			wid = -1;
		
		
		api.length = 0;
		
		
		api.word = function() {
			return data[wid = Math.max(Math.min(wid, data.length-1), 0)];
		}
		
		api.nextWord = function() {
			wid++;
			return api.word();
		}
		
		api.prevWord = function() {
			wid--;
			return api.word();
		}
		
		api.nextSentense = function() {
			while (++wid < data.length && !isSentenceEnd(data[wid])) {}
			wid++;
			return api.word();
		}
		
		api.prevSentense = function() {
			wid--;
			while (--wid >= 0 && !isSentenceEnd(data[wid])) {}
			wid++;
			return api.word();
		}
		
		api.lastWord = function() {
			wid = data.length-1;
			return api.word();
		}
		
		api.firstWord = function() {
			wid = 0;
			return api.word();
		}
		
		api.wordAtIndex = function(index) {
			wid = data.length-1;
			
			for (var i = 0; i < data.length; i++) {
				if (data[i].endIndex >= index) {
					wid = i;
					break;
				}
			}
			
			return api.word();
		}
		
		
		api.isLastWord = function() {
			return wid >= data.length-1;
		}
		
		api.isFirstWord = function() {
			return wid <= 0;
		}
		
		api.isSentenceStart = function() {
			return !wid || isSentenceEnd(data[wid-1]);
		}
		
		api.isSentenceEnd = function() {
			return isSentenceEnd(data[wid]);
		}
		
		api.isDelayed = function() {
			var token = api.word(),
				types = token.getTypes();
			
			return types.length > 1 || types[0] !== CHAR_COMMON;
		}
		
		
		api.getContext = function() {
			var token = api.word();
			return {
				before: api.text.substring(0, token.startIndex),
				after: api.text.substring(token.endIndex)
			};
		}
		
		
		api.parse = function() {
			if (app.get('entityAnalysis')) {
				api.text = cleanUpText(raw);
				data = app.parse4(api.text);
			}
			else {
				api.text = cleanUpTextSimple(raw);
				data = app.simpleParser(api.text);
			}
			
			api.length = data.length;
		}
		
	}
	
	
	// http://forums.mozillazine.org/viewtopic.php?f=25&t=834075
})(window.fastReader);
