// this has the access to the web page of the current url
console.log("content.js loaded!");

$(document).ready(function(){

	// global vars
	var ConnectPageInterval,PeriodInterval;
	var ConnectCount = 0;

	chrome.storage.local.get(['InvitedTotal','ConnectCount'], function(data) {
		console.log("initialize variables");
		if (typeof data.InvitedTotal === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'InvitedTotal': 0}, function() {
			  console.log('Settings saved');
			});
		}else{
			console.log("Data InvitedTotal: "+data.InvitedTotal);
		}
		if (typeof data.ConnectCount === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'ConnectCount': 0}, function() {
			  console.log('Settings saved');
			});
		}else{
			console.log("Data ConnectCount: "+data.ConnectCount);
		}
	});
	
	function updateValues(valueName, value){
		console.log("updateValues called");
		console.log("value: "+ value);
	  	console.log("valueName: "+ valueName);
		chrome.runtime.sendMessage({action: "updateValues",valueName:valueName, value:value}, function(response) {
	
		});
	}

	function nextPage(){
		var page = 1;
		page ++;
		console.log("goint to page: "+page)
		window.location = "https://.linkedin.com/search/results/people/?facetIndustry=%5B%2296%22%2C%224%22%5D&facetNetwork=%5B%22S%22%5D&keywords=Recruiter&origin=FACETED_SEARCH&page="+page;
	}

	function connectFromSearchPage(){
		$('html, body').animate({
		   	scrollTop: 1000
		   }, 3000);
		   setTimeout(function(){
		   	var connectElements = $(".search-result__actions--primary:contains('Connect')");
		    console.log("total connect button found: "+ connectElements.length);
		    var index = 0;
		    if (connectElements.length > 0) {
			    ConnectPageInterval = setInterval(function(){
			    	if (index == connectElements.length-1) {
			    		$('html, body').animate({
				        	scrollTop: $(connectElements.get(index)).offset().top
				    	}, 300);
				    	// connectElements.get(index).click();
				    	// $(".button-primary-large").click();
				    	ConnectCount ++;
				    	clearInterval(ConnectPageInterval);
				    	console.log("interval cleared!");
				    	console.log("index: "+index);
				    	updateValues('InvitedTotal',1);
				    	updateValues('ConnectCount',ConnectCount);
				    	nextPage();
				    	index = 0;
				    	connectFromSearchPage();
			    	}else{
			    		$('html, body').animate({
				        	scrollTop: $(connectElements.get(index)).offset().top
				    	}, 300);
				    	// connectElements.get(index).click();
				    	// $(".button-primary-large").click();
				    	ConnectCount ++;
				    	console.log("index: "+index);
				    	updateValues('InvitedTotal',1);
				    	updateValues('ConnectCount',ConnectCount);
				    	index ++;
			    	}
			    	console.log("Connect Count: "+ ConnectCount);
			    },3000);
			}
		    else{
		    	updateValues('InvitedTotal',connectElements.length);
		    }
			    
		   },5000);
	}
	
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
	  	if (request.action === 'start') {
	  		connectFromSearchPage();
		}
		if (request.action === 'stop') {
			clearInterval(ConnectPageInterval);
			location.reload();
			console.log("stopped!");
		}

	});

});