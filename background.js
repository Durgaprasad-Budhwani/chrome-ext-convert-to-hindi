    chrome.contextMenus.create({"title": "Hindi Translator", "contexts":["selection"], "onclick": translateSelectionClick});
	
	function translateSelectionClick(info) {
		chrome.tabs.getSelected(null, function(tab) {
			if (!isInExtensionGallery(tab))	{
				chrome.tabs.sendRequest(tab.id, {action: "createTooltip", text: info.selectionText});
			}
		});
	}

    // this is recommended - not to use extensions  for google chrome extensions store
	function isInExtensionGallery(tab) {
		var inExtGallery = new RegExp('^https?://(([^/]*\.)|)chrome\.google\.com(|/.*)$');
		if (inExtGallery.test(tab.url)) { alert(chrome.i18n.getMessage('chrome_in_extension_gallery')); return true; }
		else { return false; }
	}
