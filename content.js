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

	var firstname;

	var ProfileLists, ListNames;
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
		// for message module
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

		// for list module
		// if (typeof data.ProfileLists === 'undefined') {
		// 	chrome.storage.local.set({'ProfileLists': new Object()});
		// 	ProfileLists = new Object();
		// }else{
		// 	ProfileLists = data.ProfileLists;
		// 	ListNames = Object.keys(data.ProfileLists);
		// 	console.log("List Names: "+ListNames);
		// }

		getAllLists();

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
					Note = data.Note;
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
			$("#moduleSelector").removeAttr("disabled");
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

		$("#btnContinueConnect").click(function(){
			$(this).attr("disabled","disabled");
			$("#btnStart").attr("disabled","disabled");
			$("#btnStop").removeAttr("disabled");
			chrome.storage.local.set({'Status':'continueConnect'});
			navigateToLastPage();
		});

		chrome.storage.local.get(['LastPage'],function(data){
				
			if (typeof data.LastPage === 'undefined') {
				$("#btnContinueConnect").attr("disabled","disabled");
			}else{
				$("#btnContinueConnect").removeAttr("disabled");
			}
		});

		// broadcast message main control scripts starts here
		$("#moduleSelector").change(function(){
			var selected = $("#moduleSelector").val();
			switch (selected) {
				case '1':
					$("#connectNewContacts").show();
					$("#broadcastMessage,#extractEmails,#ProfileLists").hide();
				break;
				case '2':
					$("#connectNewContacts,#extractEmails,#ProfileLists").hide();
					$("#broadcastMessage").show();
				break;
				case '3':
					$("#extractEmails").show();
					$("#broadcastMessage, #connectNewContacts,#ProfileLists").hide();
				break;
				case '4':
					$("#ProfileLists").show();
					$("#broadcastMessage, #connectNewContacts,#extractEmails").hide();
				break;
			}
		});
		$("#btnStartMsg").removeAttr("disabled");

		// message broadcast buttons
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
		// end message broadcast buttons

		// create list button
		$("#btnAddList").click(function(){
			if($.trim($("#NewListName").val()).length === 0 ){
				alert("List name can't be empty!");
			}else{
				var listName = $.trim($("#NewListName").val());
				addNewList(listName);
			}
		});

		$("#btnViewList").click(function(){
			getAllLists();
		});
		// end create list button

		$("#listSelector").change(function(){
			var selected = $("#listSelector").val();
			if (selected == "none") {
				$("#ActiveList").hide();
			}else{
				$("#ActiveListName").text(selected);
				$("#ActiveList").show();
			}
		});

	},5000);
	
});