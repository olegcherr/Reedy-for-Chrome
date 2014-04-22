

function onStartReadingBtn() {
	var text = $textarea.value.trim();
	
	if (text.length) {
		app.startReader(text);
		app.event('Reader', 'Open', 'Offline');
	}
	else {
		$textarea.focus();
	}
	
	app.event('Offline', 'Start reading', app.roundExp(text.length));
}

function onClearBtn() {
	$textarea.value = '';
	localStorage['offlineText'] = '';
	$textarea.focus();
	app.event('Offline', 'Clear text');
}

function onSaveTextBtn() {
	localStorage['offlineText'] = $textarea.value.trim();
	$textarea.focus();
	app.event('Offline', 'Save text');
}



var app = window.reedy,
	$textarea = document.querySelector('textarea'),
	$startReadingBtn = document.querySelector('.j-startReadingBtn'),
	$clearBtn = document.querySelector('.j-clearBtn'),
	$saveTextBtn = document.querySelector('.j-saveTextBtn');

app.isOfflinePage = true;

app.localizeElements(document);


if (localStorage['offlineText'])
	$textarea.value = localStorage['offlineText'];

$textarea.focus();


app.on($startReadingBtn, 'click', onStartReadingBtn);
app.on($clearBtn, 'click', onClearBtn);
app.on($saveTextBtn, 'click', onSaveTextBtn);
