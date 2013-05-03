/*  Domeo Chrome Extension v0.1
	Tom Wilkin - Eli Lilly and Company Ltd
	Last Updated - 08-Apr-2013
*/

function checkForChromePage(url) {
	// check the URL isn't a Chrome maintenance tab
	if(url.indexOf("chrome://") == -1)
		return false;
	return true;
} // end function checkForChromePage

function checkForDomeoPage(url) {
	// check the URL isn't already a Domeo tab
	var domeoURL = localStorage["domeoURL"];
	if(url.indexOf(domeoURL) == -1)
		return false;
	return true;
} // end function checkForDomeoPage

function openInDomeo(url) {
	// get the Domeo URL value from the options
	var domeoURL = localStorage["domeoURL"];

	// check the URL isn't already a Domeo tab
	if(checkForDomeoPage(url)) {
		alert("The current page is already being shown in Domeo.");
		return;
	}

	// check the URL isn't just a Chrome tab
	if(checkForChromePage(url)) {
		// first check if this is a new tab
		if(url.indexOf("chrome://newtab") != -1) {
			// open Domeo in this tab
			chrome.tabs.query({"active": true, "url": url}, function(tab) {
				chrome.tabs.update(tab[0].tabId, {"url": domeoURL});
			});
			return;
		}
		
		// just open Domeo in a new tab
		chrome.tabs.create({ "url": domeoURL });
		return;
	}
	
	// open Domeo for the URL in a new tab
	var tabURL = domeoURL + "/web/domeo?url=" + url;
	chrome.tabs.create({"url": tabURL});
} // end function openInDomeo

function checkForAnnotations(url, tab) {
	// check the tab URL isn't a Chrome or a Domeo tab
	if(checkForChromePage(url))
		return;
	if(checkForDomeoPage(url))
		return;
		
	// if the key is empty then don't attempt to contact the service
	if(localStorage["domeoKey"] == null)
		return;
		
	// Call the Domeo API to check this URL for annotations
	var domeoURL = localStorage["domeoURL"] + "/share/annotationSetsByUrl?url="
			+ url + "&key=" + localStorage["domeoKey"];
	var xhr = new XMLHttpRequest( );
	xhr.open("GET", domeoURL, true);
	xhr.onreadystatechange = function( ) {
		// receive the response
		var response = JSON.parse(xhr.responseText);
		
		// process it
		if(response["totalAnnotations"] > 0) {
			// we have annotations, add the content script
			chrome.tabs.executeScript(tab.id, 
					{"file": "annotations.js", "runAt": "document_end"});
			chrome.tabs.insertCSS(tab.id, 
					{"file": "annotations.css", "runAt": "document_end"});
			
			// execute it
			chrome.tabs.sendMessage(tab.id, 
					{"annotations": response["totalAnnotations"]}, null);
		}
	}
	xhr.send( );
} // end function checkForAnnotations

function getDomeoKey(url, tab) {
	// check that this is a Domeo page
	if(checkForDomeoPage(url)) {
		// add the content script to extract the cookie
		chrome.tabs.executeScript(tab.id, 
					{"file": "cookie_handler.js", "runAt": "document_end"});
	}
} // end function getDomeoKey

function extractSessionKey(cookie) {
	// store the key from the cookie
	var matches = cookie.match(/grails_remember_me=([a-zA-Z0-9]*);/);
	if(matches != null)
		localStorage["domeoKey"] = matches[1];
	else {
		// the user has logged out
		localStorage["domeoKey"] = null;
	}
} // end extractSessionKey

// Check the page for Domeo annotations
chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
	// check that the tab has finished loading before checking for annotations
	if(changeInfo.status != "complete")
		return;

	// get the URL for this tab
	var url = tab.url;
	
	// Find a Domeo key, if available
	getDomeoKey(url, tab);
	
	// Call the Domeo API to check this URL for Domeo annotations
	checkForAnnotations(url, tab);
});

// Add listener for button click
chrome.browserAction.onClicked.addListener(function( ) {
	// The user wishes to open the current tab in Domeo	
	// open the active tab in Domeo
	chrome.tabs.query({"active": true}, function(tabs) {
		openInDomeo(tabs[0].url);
	});
});

// Create context menu for links
var id = chrome.contextMenus.create({
	"id": "domeolink",
	"title": "Open link in Domeo", 
	"contexts": ["link"]
});
chrome.contextMenus.onClicked.addListener(function(info, tab) {
	// open the right-clicked link in Domeo
	openInDomeo(info.linkUrl);
});

// Register a listener for content page requests
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.type == "openInDomeo")
		openInDomeo(request.url);
	else if(request.type == "cookie")
		extractSessionKey(request.cookie);
});
