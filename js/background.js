chrome.browserAction.onClicked.addListener(function (tab) {
	console.log(tab.url);
	/*chrome.tabs.executeScript(null, {
		code: 'window.jetzt.select()'
	});*/
});

chrome.contextMenus.create({
	id: "fastReaderMenu",
	title: "Read this with FastReader",
	contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener(function (data) {
	if (data.menuItemId == 'fastReaderMenu') {
		chrome.tabs.executeScript(null, {
			code: 'fastReader.start()'
		});
	}
});