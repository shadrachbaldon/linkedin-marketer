// this has the access to the web page of the current url
console.log("content.js loaded!");

$(document).ready(function(){

	// global vars
	var interval;

	chrome.storage.local.get('InvitedTotalToday', function(result) {
		if (typeof result.InvitedTotalToday === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'InvitedTotalToday': 0}, function() {
			  console.log('Settings saved');
			});
		}else{
			console.log(result.InvitedTotalToday);
		}
		
	});
	
	function updateValues(valueName, value){
		console.log("updateValues called");
		console.log("value: "+ value);
	  	console.log("valueName: "+ valueName);
		chrome.runtime.sendMessage({action: "updateValues",valueName:valueName, value:value}, function(response) {
	
		});
	}

	function connectFromSearchPage(){
		$('html, body').animate({
		   	scrollTop: 1000
		   }, 3000);
		   setTimeout(function(){
		   	var connectElements = $(".search-result__actions--primary:contains('Connect')");
		    console.log("total connect button found: "+ connectElements.length);
		    if (connectElements.length > 0) {
				var index = 0;
			    interval = setInterval(function(){
			    	if (index == connectElements.length-1) {
			    		$('html, body').animate({
				        	scrollTop: $(connectElements.get(index)).offset().top
				    	}, 300);
				    	// connectElements.get(index).click();
				    	// $(".button-primary-large").click();
				    	clearInterval(interval);
				    	console.log("interval cleared!");
				    	console.log("index: "+index);
				    	updateValues('InvitedTotalToday',connectElements.length);
				    	index = 0;
			    	}else{
			    		$('html, body').animate({
				        	scrollTop: $(connectElements.get(index)).offset().top
				    	}, 300);
				    	// connectElements.get(index).click();
				    	// $(".button-primary-large").click();
				    	console.log("index: "+index);
				    	index ++;
			    	}
			    },3000);
			}
		    else{
		    	updateValues('InvitedTotalToday',connectElements.length);
		    }
			    
		   },5000);
	}
	
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
	  	if (request.action === 'start') {
	  		connectFromSearchPage();
		}
		if (request.action === 'stop') {
			clearInterval(interval);
			console.log("stopped!");
		}

	});

});