// this has the access to the web page of the current url
console.log("content.js loaded!");

$(document).ready(function(){
  console.log($("#login-email").val("test"));
});
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	if (request.action === 'clicked') {
  		// var profileLinkRegEx = '^https\:\/\/www\.linkedin\.com\/in\/\S*$';
  		var connectElements = $(".search-result__image-wrapper [data-control-name=search_srp_result]");
  		connectElements.each(function(element){
  			console.log($(this).attr("href"));
  		});
	    
	    sendResponse({status: "response from content.js"});
	}
});