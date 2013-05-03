/*  Domeo Chrome Extension v0.1
	Tom Wilkin - Eli Lilly and Company Ltd
	Last Updated - 08-Mar-2013
*/

// Save the options to local storage
function saveOptions( ) {
	// save the Domeo URL
	var domeoURL = document.getElementById("domeoURL").value;
	localStorage["domeoURL"] = domeoURL;
	
	// tell the user the save occured
	var status = document.getElementById("status");
	status.innerHTML = "Options saved.";
	
	// reset the status
	setTimeout(function( ) {
			status.innerHTML = "";
		}, 850);
} // end function saveOptions

// Restore the options from local storage
function restoreOptions( ) {
	// get the URL from local storage
	var domeoURL = localStorage["domeoURL"];
	if(!domeoURL)
		return;
		
	// set the previous URL as the current value
	document.getElementById("domeoURL").value = domeoURL;
	
	// show the key
	document.getElementById("key").innerHTML = localStorage["domeoKey"];
} // end function restoreOptions

// register the functions
document.addEventListener("DOMContentLoaded", function( ) {
	// restore the previous options
	restoreOptions( );
	
	// make the save button clickable
	document.getElementById("save").addEventListener("click", saveOptions);
});
