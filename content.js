// this has the access to the web page of the current url
$(document).ready(function(){
	console.log("content.js loaded!");
	// inject the ui
	$.get(chrome.extension.getURL('/ui.html'), function(data) {
	    $(data).appendTo('body');
	});
	// global vars
	var ConnectPageInterval,Status,InvitedTotal,ConnectPerPeriod,HoursPerPeriod,Note;
	var ConnectCount = 0;

	var MessagePageInterval, MessageSentTotal, MessagePerPeriod, MessageHoursPerPeriod, Message;
	var MessageCount = 0;
	// initialize values
	chrome.storage.local.get(null, function(data) {
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
		if (typeof data.MessageSentTotal === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'MessageSentTotal': 0});
			MessageSentTotal = 0;
		}else{
			console.log("Data MessageSentTotal: "+data.MessageSentTotal);
			MessageSentTotal = data.MessageSentTotal;
		}
		if (typeof data.MessageCount === 'undefined') {
			console.log("no value");
			chrome.storage.local.set({'MessageCount': 0});
			MessageCount = 0;
		}else{
			console.log("Data MessageCount: "+data.MessageCount);
			MessageCount = data.MessageCount;
		}
		console.log('Settings saved');
	});

	setTimeout(function(){
		console.log("ConnectPerPeriod: "+ ConnectPerPeriod);
		if (Status === "continueConnect") {
			chrome.storage.local.set({'Status':'false'});
			$("#moduleSelector").attr("disabled","disabled");
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
		}
		else if(Status === "continueMessage"){
			$("#moduleSelector").val("2");
			$("#connectNewContacts").hide();
			$("#broadcastMessage").show();
			$("#moduleSelector").attr("disabled","disabled");
			chrome.storage.local.set({'Status':'false'});
			chrome.storage.local.get(['MessagePerPeriod','MessageHoursPerPeriod','Message'],function(data){
				
				$("#MessagePerPeriod").val(data.MessagePerPeriod);
				$("#MessageHoursPerPeriod").val(data.MessageHoursPerPeriod);
				$("#message").val(data.Message);
				MessageHoursPerPeriod = parseInt(data.MessageHoursPerPeriod);
				MessagePerPeriod = parseInt(data.MessagePerPeriod);
				Message = data.Message;
				console.log("===Continue MessageHoursPerPeriod: "+ data.MessageHoursPerPeriod);
				console.log("===Continue MessagePerPeriod: "+ data.MessagePerPeriod);
				console.log("===Continue Message: "+ data.Message);
			});
			$("#btnStartMsg").attr("disabled","disabled");
			$("#btnStopMsg").removeAttr("disabled");
			SendMessageFromSearchPage(0);
		}else{
			$("#Status").text("Ready").css("color","#00aa00");
			$("#btnStart").removeAttr("disabled");
		}
		
		$("#TotalInvited").text(InvitedTotal);
		$("#CurrentPeriodConnect").text(ConnectCount);

		$("#TotalSent").text(MessageSentTotal);
		$("#CurrentPeriodSent").text(MessageCount);

		$("#btnStart").click(function(){
			ConnectPerPeriod = $("#ConnectsPerPeriod").val();
			HoursPerPeriod = $("#HoursPerPeriod").val();
			// check if there is a note
			if ($.trim($('#note').val()).length > 0) {
				Note = $('#note').val();
				chrome.storage.local.set({'Note':Note});
			}
			// check if connect per period and hours per period is empty
			if (ConnectPerPeriod === '' || HoursPerPeriod === '') {
				alert("Connects and Hours per period must have a value!");
			}else{
				// if connect per period and hours per period is not empty
				$(this).attr("disabled","disabled");
				$("#moduleSelector").attr("disabled","disabled");
				$("#btnStop").removeAttr("disabled");
				HoursPerPeriod = parseInt(HoursPerPeriod);
				ConnectPerPeriod = parseInt(ConnectPerPeriod);
				chrome.storage.local.set({'ConnectPerPeriod':ConnectPerPeriod,'HoursPerPeriod':HoursPerPeriod});
				connectFromSearchPage();
			}
			
		});
		$("#btnStop").click(function(){
			// executes when cancel button is clicked
			$("#btnStart").removeAttr("disabled");
			$("#moduleSelector").removeAttr("disabled");
			$(this).attr("disabled","disabled");
			chrome.storage.local.set({'ConnectCount':0, 'Status':'false'});
			ConnectCount = 0;
			clearInterval(ConnectPageInterval);
			console.log("canceled");
			window.location.reload();
		});

		// broadcast message main control scripts starts here
		$("#moduleSelector").change(function(){
			if ($("#moduleSelector").val() === '1') {
				$("#connectNewContacts").show();
				$("#broadcastMessage").hide();
			} else {
				$("#connectNewContacts").hide();
				$("#broadcastMessage").show();
			}
		});
		$("#btnStartMsg").removeAttr("disabled");

		$("#btnStartMsg").click(function(){
			MessagePerPeriod = $("#MessagePerPeriod").val();
			MessageHoursPerPeriod = $("#MessageHoursPerPeriod").val();
			MessageHoursPerPeriod = parseInt(MessageHoursPerPeriod);
			MessagePerPeriod = parseInt(MessagePerPeriod);
			if (MessagePerPeriod === '' || MessageHoursPerPeriod === '' || $.trim($('#message').val()).length === 0) {
				alert("All fields must have a value!");
			}else{
				console.log("MessageHoursPerPeriod: "+MessageHoursPerPeriod);
				console.log("MessagePerPeriod: "+MessagePerPeriod);
				Message = $('#message').val();
				chrome.storage.local.set({'MessagePerPeriod':MessagePerPeriod,'MessageHoursPerPeriod':MessageHoursPerPeriod,'Message':Message});
				$(this).attr("disabled","disabled");
				$("#moduleSelector").attr("disabled","disabled");
				$("#btnStopMsg").removeAttr("disabled");
				SendMessageFromSearchPage(0);
			}

		});

		$("#btnStopMsg").click(function(){
			$(this).attr("disabled","disabled");
			$("#btnStartMsg").removeAttr("disabled");
			chrome.storage.local.set({'MessageCount':0, 'Status':'false'});
			clearInterval(MessagePageInterval);
			console.log("canceled");
			window.location.reload();

		});

	},5000);
	
	
	function updateValues(name, value){
		// console.log("updateValues called");
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
					// console.log("update values total: "+total);
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
			case "MessageSentTotal":
				var total = 0;
				chrome.storage.local.get('MessageSentTotal',function(data){
					total = value + parseInt(data.MessageSentTotal);
					chrome.storage.local.set({'MessageSentTotal':total},function(){
					});
					$("#TotalSent").text(total);
		        });
			break;
			case "MessageCount":
				var total = 0;
		        chrome.storage.local.get('MessageCount',function(data){
		          	total = value + parseInt(data.MessageCount);
		          	chrome.storage.local.set({'MessageCount':total});
		          	$("#CurrentPeriodSent").text(total);
					// console.log("update values total: "+total);
		        });
			break;
		}
	}

	function nextPage(action){
		var page;
		var url = window.location.href;
		if (url.search("page=") >= 0) {
			page = url.substring(url.search("page=")+5, url.length);
			page = parseInt(page);
			// console.log(page);
		}else{
			page = 1
			// console.log("1");
		}
		switch(action){
			case 'connect':
				if (page < 100) {
					$("button.next").click();
				}else{
					$("#Status").text("Finished").css("color","#fbbc05");
					alert("Task Completed!");
					$("#btnStop").click();
				}
			break;
			case 'message':
				if ($(".next-text").length == 0) {
					$("#Status").text("Finished").css("color","#fbbc05");
					alert("Task Completed!");
					$("#btnStopMsg").click();
				}else{
					$("button.next").click();
				}
			break;
		}
				
	}

	function standBy(fromModule,index){
		// console.log("standBy called");
		chrome.storage.local.set({'LastPage':window.location.href});
		$("#nextPeriodWrap").show();
	    $("#Status").text("Waiting for the next period").css("color","#aa0000"); //change the status display
	    if (fromModule === 'connect') {
		    $("#nextPeriodCount").countdowntimer({
		      	hours:HoursPerPeriod,
		      	stopButton : "btnStop",
		      	timeUp: function(){
		        	// console.log("Moving to next period.");
		        	$("#nextPeriodWrap").hide();
	        		$("#Status").text("Connecting new contacts..").css("color","#0000aa");
		        	chrome.storage.local.set({'ConnectCount':0,'Status':'continueConnect'});
		        	window.location.reload();
		      	}
		    });
		}else{
			$("#nextPeriodCount").countdowntimer({
		      	seconds:MessageHoursPerPeriod,
		      	stopButton : "btnStopMsg",
		      	timeUp: function(){
		        	// console.log("Moving to next period.");
		        	$("#nextPeriodWrap").hide();
		        	$("#Status").text("Sending message..").css("color","#0000aa");
		        	chrome.storage.local.set({'MessageCount':0,'Status':'continueMessage'});
		        	MessageCount = 0;
		        	$("#CurrentPeriodSent").text("0");
		        	SendMessageFromSearchPage(index);
		      	}
		    });
		}
	}

	function navigateToLastPage(){
		chrome.storage.local.get('LastPage',function(data){
			window.location = data.LastPage;
		});
	}

	function getFirstName(index){
		nameElements = $(".actor-name");
		var name = nameElements.get(index).textContent
		var fname = name.substring(0, name.indexOf(" "));
		return fname;
	}

	function connectFromSearchPage(){
		$("#Status").text("Connecting new contacts...").css("color","#0000aa");
		$('html, body').animate({
		   	scrollTop: 1000
		   }, 3000);
		   setTimeout(function(){
		   	var connectElements = $(".search-result__actions--primary:contains('Connect')");
		    console.log("ConnectPerPeriod: "+ConnectPerPeriod);
			var index = 0;
		    if (connectElements.length > 0) {
			    ConnectPageInterval = setInterval(function(){
			    	if (ConnectCount >= ConnectPerPeriod) { //make this dynamic
			    		clearInterval(ConnectPageInterval);
			    		console.log("stopped! limit reached");
			    		standBy('connect',index);
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
					    	nextPage('connect');
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

	function SendMessageFromSearchPage(index){
		console.log("index: "+index);
		$("#Status").text("Sending message...").css("color","#0000aa");
		$('html, body').animate({
		   	scrollTop: 1000
		}, 3000);
		setTimeout(function(){
		   	var msgElements = $(".search-result__actions--primary:contains('Message')"); 
		    if (msgElements.length > 0) {
		    	MessagePageInterval = setInterval(function(){
		    		if (MessageCount >= MessagePerPeriod) {
			    		clearInterval(MessagePageInterval);
			    		standBy('message',index);
			    	}else{
			    		if (index == msgElements.length-1) {
				    		$('html, body').animate({
					        	scrollTop: $(msgElements.get(index)).offset().top
					    	}, 300);
					    	msgElements.get(index).click();
					    	var firstname = getFirstName(index);
					    	var msg = Message.replace("{first name}", "${firstname}");
					    	msg = eval("`"+msg+"`");
					    	$(".msg-messaging-form__message:first").val(msg);
					    	// setTimeout(function(){
					    		$(".msg-messaging-form__send-button").removeAttr("disabled");
					    		// $(".msg-messaging-form__send-button").click();
					    		// $(".msg-messaging-form__send-button").click();
					    	// },2000);
					    	// setTimeout(function(){
					    	// 	$(".msg-overlay-bubble-header__control--close-btn").click();
					    	// },5000);
					    	MessageCount ++;
					    	clearInterval(MessagePageInterval);
					    	updateValues('MessageSentTotal',1);
					    	updateValues('MessageCount',1);
					    	nextPage('message');
					    	index = 0;
					    	setTimeout(function(){
					    		// waits 3 seconds before continuing to make sure next page elements was loaded
					    		SendMessageFromSearchPage(index);
					    	},3000);
				    	}else{
				    		$('html, body').animate({
					        	scrollTop: $(msgElements.get(index)).offset().top
					    	}, 300);
					    	msgElements.get(index).click();
					    	var firstname = getFirstName(index);
					    	var msg = Message.replace("{first name}", "${firstname}");
					    	msg = eval("`"+msg+"`");
					    	$(".msg-messaging-form__message:first").val(msg);
					    	// setTimeout(function(){
					    		$(".msg-messaging-form__send-button").removeAttr("disabled");
					    		// $(".msg-messaging-form__send-button").click();
					    		// $(".msg-messaging-form__send-button").click();
					    	// },2000);
					    	// setTimeout(function(){
					    	// 	$(".msg-overlay-bubble-header__control--close-btn").click();
					    	// },5000);
					    	MessageCount ++;
					    	updateValues('MessageSentTotal',1);
					    	updateValues('MessageCount',1);
					    	index ++;
				    	}
			    	}
		    	},2000);
		    }

		},3000);
	}
});