// this has the access to the web page of the current url
console.log("content.js loaded!");

$(document).ready(function(){
  console.log($("#login-email").val("test"));
});
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	if (request.action === 'clicked') {
  		console.log("==============")
  		setTimeout(function () {
	        console.log("waiting...")
	        var connectElements = $(".search-result__actions--primary:contains('Connect')");
	        console.log("total connect button found: "+ connectElements.length);
	        for (var i = 0; i < connectElements.length; i++) {
	        	connectElements.get(i).click();
	        	console.log("harhar")
	        	setTimeout(function(){
					$(".button-primary-large").click();
					console.log("ghghjghj");
				},2000);
	        }
	  	// 	connectElements.each(function(index,element){
				// connectElements.get(index).click();
				// setTimeout(function(){
				// 	$(".button-primary-large").click();
				// },2000);
				
	  	// 		console.log($(this).attr("aria-label"));
	  	// 	});
		    
		    sendResponse({status: "response from content.js"});
	    }, 3000);
	  		
	}
});