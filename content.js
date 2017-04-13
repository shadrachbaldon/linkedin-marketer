// this has the access to the web page of the current url
$(document).ready(function(){
	console.log("content.js loaded!");
	// inject the ui
	$.get(chrome.extension.getURL('/ui.html'), function(data) {
	    $(data).appendTo('body');
	});
	// global vars
	var ConnectPageInterval,PeriodInterval,Status,InvitedTotal,Page;
	var ConnectCount = 0;
	// initialize values
	chrome.storage.local.get(['InvitedTotal','ConnectCount','Page','Status'], function(data) {
		console.log("initialize variables");
		if (typeof data.InvitedTotal === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'InvitedTotal': 0}, function() {
			  console.log('Settings saved');
			});
			InvitedTotal = 0;
		}else{
			console.log("Data InvitedTotal: "+data.InvitedTotal);
			InvitedTotal = data.InvitedTotal;
		}
		if (typeof data.ConnectCount === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'ConnectCount': 0}, function() {
				ConnectCount = 0;
			});
		}else{
			console.log("Data ConnectCount: "+data.ConnectCount);
			ConnectCount = data.ConnectCount;
		}
		if (typeof data.Page === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'Page': 1});
			console.log("Page: "+data.Page);
			Page = 1;
		}else{
			console.log("Page: "+data.Page);
			Page = data.Page;
		}
		if (typeof data.Status === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'Status': "false"});
			Status = "false";
			console.log("Status: "+data.Status);
			
		}else{
			console.log("Status: "+data.Status);
			Status = data.Status;
		}
		console.log('Settings saved');
	});

	setTimeout(function(){
		$("#Status").text("Ready").css("color","#00aa00");
		$("#btnStart").removeAttr("disabled");
		$("#btnStart").click(function(){
			$(this).attr("disabled","disabled");
			$("#btnStop").removeAttr("disabled");
			connectFromSearchPage();
		});
		$("#btnStop").click(function(){
			$("#btnStart").removeAttr("disabled");
			$(this).attr("disabled","disabled");
			clearInterval(ConnectPageInterval);
			console.log("canceled");
		});
	},5000);
	
	
	function updateValues(name, value){
		console.log("updateValues called");
		switch(name){
			case "InvitedTotal":
		        var total = 0;
		        chrome.storage.local.get('InvitedTotal',function(data){
		          total = value + parseInt(data.InvitedTotal);
		          chrome.storage.local.set({'InvitedTotal':total},function(){
		          });
		          $("#TotalInvited").text(total);
		        });
			break;
			case "ConnectCount":
				var total = 0;
		        chrome.storage.local.get('ConnectCount',function(data){
		          	total = value + parseInt(data.ConnectCount);
		          	chrome.storage.local.set({'ConnectCount':total},function(){
		          	});
		          	$("#CurrentPeriodConnect").text(total);

		        });
			break;
			case "nextPage":
				console.log("popup.js nextPage");
			    setTimeout(function(){
			    	connectFromSearchPage();
			    },5000);
			break;
			case "standBy":
				$("#nextPeriodWrap").show();
			    $("#Status").text("Waiting for the next period"); //change the status display
			    $("#nextPeriodCount").countdowntimer({
			      hours:0,
			      minutes:0,
			      seconds:10,
			      timeUp: function(){
			        console.log("Moving to next period.");
			        $("#nextPeriodWrap").hide();
			        $("#Status").text("Connecting new contacts..");
			        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			          chrome.tabs.sendMessage(tabs[0].id, {action: "navigateToLastPage"});
			        });
			        setTimeout(function(){
			          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			            chrome.tabs.sendMessage(tabs[0].id, {action: "start"});
			          });
			        },5000);
			      }
			    });
			break;
		}
	}

	function nextPage(){
		chrome.storage.local.get('Page', function(data) {
			var page = parseInt(data.Page);
			console.log("page: "+page);
			console.log("data.Page: "+data.Page);
			page = page + 1;
			console.log("data.Page: "+data.Page);
			updateValues('Page',1);
			// chrome.runtime.sendMessage({action: "nextPage"});
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

	function standBy(){
		console.log("standBy called");
		chrome.runtime.sendMessage({action: "standBy"});
		chrome.storage.local.set({'lastPage':window.location.href});
	}

	function reload(){
		window.location.reload();
	}

	function navigateToLastPage(){
		chrome.storage.local.get('lastPage',function(data){
			console.log("lastPage: "+data.lastPage);
			window.location = data.lastPage;
		});
	}

	function connectFromSearchPage(){
		$("#Status").text("Connecting new contacts...").css("color","#0000aa");
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
			    		standBy();
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

});