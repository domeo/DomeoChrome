/*  Domeo Chrome Extension v0.1
	Tom Wilkin - Eli Lilly and Company Ltd
	Last Updated - 08-Apr-2013
*/

// Get the cookie and send it to the background page
chrome.extension.sendMessage({
		"type": "cookie",
		"cookie": document.cookie
});