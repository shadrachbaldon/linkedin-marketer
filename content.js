// this has the access to the web page of the current url
$(document).ready(function(){
	console.log("content.js loaded!");
	// inject the ui
	$.get(chrome.extension.getURL('/ui.html'), function(data) {
	    $(data).appendTo('body');
	});
	// chrome.storage.local.clear();
	// global vars
	var ConnectPageInterval,PeriodInterval,Status,InvitedTotal,Page,ConnectPerPeriod,HoursPerPeriod,Note;
	var ConnectCount = 0;
	// initialize values
	chrome.storage.local.get(['InvitedTotal','ConnectCount','Status'], function(data) {
		console.log("initialize variables");
		if (typeof data.InvitedTotal === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'InvitedTotal': 0}, function() {
			});
			InvitedTotal = 0;
		}else{
			console.log("Data InvitedTotal: "+data.InvitedTotal);
			InvitedTotal = data.InvitedTotal;
		}
		if (typeof data.ConnectCount === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'ConnectCount': 0}, function() {
			});
		}else{
			console.log("Data ConnectCount: "+data.ConnectCount);
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
		
		console.log("ConnectPerPeriod: "+ ConnectPerPeriod);
		if (Status === "continue") {
			chrome.storage.local.get(['ConnectPerPeriod','HoursPerPeriod','Note'],function(data){
				
				if (typeof data.Note === 'undefined') {
					$("#ConnectsPerPeriod").val(data.ConnectPerPeriod);
					$("#HoursPerPeriod").val(data.HoursPerPeriod);
					HoursPerPeriod = parseInt(data.HoursPerPeriod);
					ConnectPerPeriod = parseInt(data.ConnectPerPeriod);
				}else{
					$("#ConnectsPerPeriod").val(data.ConnectPerPeriod);
					$("#HoursPerPeriod").val(data.HoursPerPeriod);
					$("#note").val(data.Note);
					HoursPerPeriod = parseInt(data.HoursPerPeriod);
					ConnectPerPeriod = parseInt(data.ConnectPerPeriod);
				}
			});
			$("#btnStart").attr("disabled","disabled");
			$("#btnStop").removeAttr("disabled");
			connectFromSearchPage();
		}else{
			$("#Status").text("Ready").css("color","#00aa00");
			$("#btnStart").removeAttr("disabled");
		}
		$("#TotalInvited").text(InvitedTotal);
		$("#CurrentPeriodConnect").text(ConnectCount);
		$("#btnStart").click(function(){
			ConnectPerPeriod = $("#ConnectsPerPeriod").val();
			HoursPerPeriod = $("#HoursPerPeriod").val();
			HoursPerPeriod = parseInt(HoursPerPeriod);
			ConnectPerPeriod = parseInt(ConnectPerPeriod);
			if ($.trim($('#note').val()).length > 0) {
				Note = $('#note').val();
				chrome.storage.local.set({'ConnectPerPeriod':ConnectPerPeriod,'HoursPerPeriod':HoursPerPeriod,'Note':Note});
			}else{
				chrome.storage.local.set({'ConnectPerPeriod':ConnectPerPeriod,'HoursPerPeriod':HoursPerPeriod});
			}
			Note = $("#note").val();
			if (ConnectPerPeriod === '' || HoursPerPeriod === '') {
				alert("Connects and Hours per period must have a value!");
			}else{
				
				console.log("HoursPerPeriod: "+HoursPerPeriod);
				console.log("CoonectPerPeriod: "+ConnectPerPeriod);
				$(this).attr("disabled","disabled");
				$("#btnStop").removeAttr("disabled");
				connectFromSearchPage();
			}
			
		});
		$("#btnStop").click(function(){
			$("#btnStart").removeAttr("disabled");
			$(this).attr("disabled","disabled");
			chrome.storage.local.set({'ConnectCount':0, 'Status':'false'});//
			ConnectCount = 0;
			clearInterval(ConnectPageInterval);
			console.log("canceled");
			window.location.reload();
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
		          	chrome.storage.local.set({'ConnectCount':total});
		          	$("#CurrentPeriodConnect").text(total);
					console.log("update values total: "+total);
		        });
			break;
			case "nextPage":
				console.log("popup.js nextPage");
			    setTimeout(function(){
			    	connectFromSearchPage();
			    },5000);
			break;
			case "standBy":
				
			break;
			case "LastPage":
				chrome.storage.local.set({'LastPage':value});
			break;
		}
	}

	function nextPage(){
		var page;
		var url = window.location.href;
		if (url.search("page=") >= 0) {
			page = url.substring(url.search("page=")+5, url.length);
			page = parseInt(page);
			console.log(page);
		}else{
			page = 1
			console.log("1");
		}
		if (page < 100) {
			$("button.next").click();
		}else{
			$("#Status").text("Finished").css("color","#fbbc05");
			alert("Task Completed!");
			$("#btnStop").click();
		}
	}

	function standBy(){
		console.log("standBy called");
		chrome.storage.local.set({'LastPage':window.location.href});
		$("#nextPeriodWrap").show();
	    $("#Status").text("Waiting for the next period").css("color","#aa0000"); //change the status display
	    $("#nextPeriodCount").countdowntimer({
	      	hours:HoursPerPeriod,
	      	timeUp: function(){
	        	console.log("Moving to next period.");
	        	$("#nextPeriodWrap").hide();
	        	$("#Status").text("Connecting new contacts..").css("color","#0000aa");
	        	chrome.storage.local.set({'ConnectCount':0,'Status':'continue'});
	        	ConnectCount = 0;
	        	window.location.reload();
	      	}
	    });
	}

	function navigateToLastPage(){
		chrome.storage.local.get('LastPage',function(data){
			console.log("LastPage: "+data.LastPage);
			window.location = data.LastPage;
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
		    console.log("ConnectPerPeriod: "+ConnectPerPeriod);
		    var index = 0;
		    if (connectElements.length > 0) {
			    ConnectPageInterval = setInterval(function(){
			    	if (ConnectCount >= ConnectPerPeriod) { //make this dynamic
			    		clearInterval(ConnectPageInterval);
			    		console.log("stopped! limit reached");
			    		standBy();
			    	}else{
			    		if (index == connectElements.length-1) {
				    		$('html, body').animate({
					        	scrollTop: $(connectElements.get(index)).offset().top
					    	}, 300);
					    	connectElements.get(index).click();
					    	if ($.trim($('#note').val()).length < 1) {
					    		console.log("empty note!");
					    		$(".button-primary-large").click();
					    	}else{
					    		console.log("found note!"+$.trim($('#note').val()).length);
					    		$(".send-invite__actions > .button-secondary-large").click();
					    		$("#custom-message").val(Note);
					    		$(".send-invite__actions > .button-primary-large").click();
					    	}
					    	
					    	ConnectCount ++;
					    	clearInterval(ConnectPageInterval);
					    	console.log("interval cleared!");
					    	console.log("index: "+index);
					    	updateValues('InvitedTotal',1);
					    	updateValues('ConnectCount',1);
					    	nextPage();
					    	index = 0;
					    	setTimeout(function(){
					    		// waits 3 seconds before continuing to make sure next page elements was loaded
					    		connectFromSearchPage();
					    	},3000);
				    	}else{
				    		$('html, body').animate({
					        	scrollTop: $(connectElements.get(index)).offset().top
					    	}, 300);
					    	connectElements.get(index).click();
					    	if ($.trim($('#note').val()).length < 1) {
					    		console.log("empty note!");
					    		$(".button-primary-large").click();

					    	}else{
					    		console.log("found note!"+$.trim($('#note').val()).length);
					    		$(".send-invite__actions > .button-secondary-large").click();
					    		$("#custom-message").val(Note);
					    		$(".send-invite__actions > .button-primary-large").click();
					    	}
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