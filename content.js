// this has the access to the web page of the current url
console.log("content.js loaded!");

$(document).ready(function(){

	// global vars
	var ConnectPageInterval,PeriodInterval;
	var ConnectCount = 0;

	chrome.storage.local.get(['InvitedTotal','ConnectCount','Page'], function(data) {
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
				ConnectCount = 0;
			  console.log('Settings saved');
			});
		}else{
			console.log("Data ConnectCount: "+data.ConnectCount);
			ConnectCount = data.ConnectCount;
		}
		if (typeof data.Page === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'Page': 1}, function() {
			  console.log('Settings saved');
			});
			console.log("Page: "+data.Page);
		}else{
			console.log("Page: "+data.Page);
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
		chrome.storage.local.get('Page', function(data) {
			var page = parseInt(data.Page);
			console.log("page: "+page);
			console.log("data.Page: "+data.Page);
			page = page + 1;
			console.log("data.Page: "+data.Page);
			updateValues('Page',1);
			chrome.runtime.sendMessage({action: "nextPage"}, function(response) {
					// console.log(response.status);
				});
			console.log("page before window.location: "+page);
			var url = window.location.href;
			if (page < 3) {
				url = window.location.href+"&page="+page;
			}else{
				url = url.substr(0,window.location.href.length-7);
				url = url+"&page="+page;
			}
			console.log("url: "+url);
			window.location = url;
		});		
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
			    	if (ConnectCount >= 10) {
			    		clearInterval(ConnectPageInterval);
			    		console.log("stopped! limit reached");

			    	}else{
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
					    	updateValues('ConnectCount',1);
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
					    	updateValues('ConnectCount',1);
					    	index ++;
				    	}
			    	}
			    	console.log("Connect Count: "+ ConnectCount);
			    },2000);
			}
		    else{
		    	updateValues('InvitedTotal',connectElements.length);
		    }
			    
		   },3000);
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