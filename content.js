// this has the access to the web page of the current url
console.log("content.js loaded!");

$(document).ready(function(){
  console.log($("#login-email").val("test"));
});
chrome.storage.local.set({'InvitedTotal': 0}, function() {
  console.log('Settings saved');
});
chrome.storage.local.get('InvitedTotal', function(result) {
  console.log(result.InvitedTotal);
});

function updateValues(valueName, value){
	console.log("updateValues called");
	chrome.runtime.sendMessage({action: "updateValues",valueName:value}, function(response) {
  		console.log(response.status);
	});
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	if (request.action === 'clicked') {
  		$('html, body').animate({
	    	scrollTop: 1000
	    }, 3000);
	    setTimeout(function(){
	    	var connectElements = $(".search-result__actions--primary:contains('Connect')");
		    console.log("total connect button found: "+ connectElements.length);
		    if (connectElements.length > 0) {
				var index = 0;
			    var interval = setInterval(function(){
			    	if (index == connectElements.length-1) {
			    		$('html, body').animate({
				        	scrollTop: $(connectElements.get(index)).offset().top
				    	}, 300);
				    	connectElements.get(index).click();
				    	$(".button-primary-large").click();
				    	clearInterval(interval);
				    	sendResponse({status: "done", sent: index+1});
				    	console.log("interval cleared!");
				    	console.log("index: "+index);
				    	index = 0;
			    	}else{
			    		$('html, body').animate({
				        	scrollTop: $(connectElements.get(index)).offset().top
				    	}, 300);
				    	connectElements.get(index).click();
				    	$(".button-primary-large").click();
				    	console.log("index: "+index);
				    	index ++;
			    	}
			    },3000);
			}
		    else{
		    	updateValues('InvitedTotal',index);
		    }
			    
	    },5000);
	}
});