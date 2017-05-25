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

	function saveForContinue(fromModule){
		switch(fromModule){
			case "connect":
				chrome.storage.local.set({
					'LastConnectPerPeriod': ConnectPerPeriod,
					'LastConnectHoursPerPeriod': HoursPerPeriod,
					'LastNote':Note
				});
			break;

			case "msgBroadcast":

			break;
		}

	}

	function standBy(fromModule,index){
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
		      	hours:MessageHoursPerPeriod,
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

	function getFirstName(from,index){
		switch(from){
			case "broadcastMessage":
				nameElements = $(".actor-name");
				var name = nameElements.get(index).textContent
				var fname = name.substring(0, name.indexOf(" "));
				return fname;
			break;
			case "Note":
				nameElements = $(".search-result__actions--primary:contains('Connect')").parentsUntil(".search-result--person").find(".actor-name");
				var name = nameElements.get(index).textContent;
				var fname = name.substring(0, name.indexOf(" "));
				return fname;
			break;
		}
				
	}

	function convertMsg(textValue){
		var msg = textValue.replace("{firstname}", "${firstname}");
		msg = eval("`"+msg+"`");
		return msg;
	}

	// indexedDB functions starts here

	var db;
	var dbrequest = window.indexedDB.open("LinkedinMarterDB", 1);
	dbrequest.onsuccess = function(event) {
       db = dbrequest.result;
       console.log("success: "+ db);
   	};        


    dbrequest.onupgradeneeded = function(event) {
        var db = event.target.result;
        var objectStore = db.createObjectStore("Lists", { keyPath: "name" });
    }

    function addNewList(listName) {
		console.log(db);
        var request = db.transaction(["Lists"], "readwrite")
        .objectStore("Lists")
        .add({ name: listName });
        
        request.onsuccess = function(event) {
        	alert(`${listName} is added!`);
           	var tag = `<option value="${listName}"> ${listName} </option>`;
			$('#listSelector').append(tag);
           	$("#NewListName").val("");
        };
        
        request.onerror = function(event) {
           alert("List already exist! ");

        }
    }

    function getAllLists(){
    	var transaction = db.transaction('Lists', 'readonly');
    	var objectStore = transaction.objectStore('Lists');

    	objectStore.getAll().onsuccess = function(event) {
			$.each(event.target.result, function(index,value){
				//gives the list dropdown values from storage
				var options = `<option value="${event.target.result[index].name}">${event.target.result[index].name}</option>`;
				$("#listSelector").append(options);
			});
    	};
    }
	


     // indexedDB functions ends here

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
					    		
					    		firstname = getFirstName("Note",index);
					    		var convertedText = convertMsg(Note);
					    		$("#custom-message").val(convertedText);
					    		console.log("Name: "+firstname);
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
					    		
					    		firstname = getFirstName("Note",index);
					    		var convertedText = convertMsg(Note);
					    		$("#custom-message").val(convertedText);
					    		console.log("Name: "+firstname);
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
							firstname = getFirstName("broadcastMessage",index);
							var convertedText = convertMsg(Message);
							$(".msg-messaging-form__message:first").val(convertedText);
							setTimeout(function(){
								$(".msg-messaging-form__send-button").removeAttr("disabled");
								$(".msg-messaging-form__send-button").click();
							},2000);
							setTimeout(function(){
								$(".msg-overlay-bubble-header__control--close-btn").click();
							},5000);
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
							firstname = getFirstName("broadcastMessage",index);
							var convertedText = convertMsg(Message);
							$(".msg-messaging-form__message:first").val(convertedText);
							setTimeout(function(){
								$(".msg-messaging-form__send-button").removeAttr("disabled");
								$(".msg-messaging-form__send-button").click();
							},2000);
							setTimeout(function(){
								$(".msg-overlay-bubble-header__control--close-btn").click();
							},5000);
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