

(function(app) {
	
	app.Tabs = function(name, $tabsWrap, $tabs, $tabContent) {
		
		function onTabMousedown(e) {
			setActiveTab(e.currentTarget.getAttribute('tab-id'));
		}
		
		function setActiveTab(id) {
			$tabsWrap.setAttribute('active-tab', id);
			
			app.each($tabs, function($tab) {
				$tab.setAttribute('active', $tab.getAttribute('tab-id') === id);
			});
			app.each($tabContent, function($elem) {
				$elem.setAttribute('active', $elem.getAttribute('tab-id') === id);
			});
			
			localStorage[KEY_ACTIVE_TAB] = id;
		}
		
		
		var KEY_ACTIVE_TAB = "Tabs.ActiveTab:"+name;
		
		
		app.each($tabs, function($elem) {
			app.on($elem, "click", onTabMousedown);
		});
		
		
		localStorage[KEY_ACTIVE_TAB] && setActiveTab(localStorage[KEY_ACTIVE_TAB]);
		
	}
	
})(window.reedy);
