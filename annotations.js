/*  Domeo Chrome Extension v0.1
	Tom Wilkin - Eli Lilly and Company Ltd
	Last Updated - 04-Apr-2013
*/

// Send the open message to the background page
var last = "";
window.addEventListener("message", function(event) {
	// Ignore non-click events
	if(event.data.url == null)
		return;
	
	// Don't allow repetitions
	if(last == window.location.href)
		return;
	last = window.location.href;
	
	// Reset the timeout, so the button will work again later
	window.setTimeout(function( ) {
		last = "";
	}, 500);
	
	// Send the message to the background page
	chrome.extension.sendMessage({
			"type": "openInDomeo", 
			"url": event.data.url
	});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	// Add the annotation bar to the page
	if(document.getElementById("domeoAnnotationBar") == null) {
		var body = document.getElementsByTagName("body");
		var div = document.createElement("div");
		var a = document.createElement("a")
		a.setAttribute("href", "javascript:void(0)");
		a.setAttribute("onclick", "window.postMessage({url: '" 
				+ window.location.href + "'}, '*')");
		var img = document.createElement("img");
		img.setAttribute("src", chrome.extension.getURL("images/domeo_16.png"));
		img.setAttribute("alt", "Domeo Logo");
		a.appendChild(img);
		div.appendChild(a);
		
		// Modify the text based on the quantity of annotations
		var before = "is";
		var annotation = "annotation";
		if(request.annotations != "1") {
			before = "are";
			annotation += "s";
		}
		
		var p = document.createElement("p");
		p.appendChild(document.createTextNode(" There " + before + " " 
				+ request.annotations + " " + annotation
				+ " available for this page in Domeo."));
		div.appendChild(p);
		div.setAttribute("id", "domeoAnnotationBar");
		body[0].appendChild(div);
	}
});
