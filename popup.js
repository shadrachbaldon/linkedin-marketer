chrome.storage.local.get(['InvitedTotal','ConnectCount'], function(data) {
  console.log("initialize variables");
  if (typeof data.InvitedTotal === 'undefined') {
    $("#TotalInvited").text("0");
  }else{
    $("#TotalInvited").text(data.InvitedTotal);
  }
  if (typeof data.ConnectCount === 'undefined') {
    $("#CurrentPeriodConnect").text("0");
  }else{
    $("#CurrentPeriodConnect").text(data.ConnectCount);
  }
});

$("#btnStart").click(function(){
  chrome.storage.local.get('InvitedTotal', function(result) {
    console.log(result.InvitedTotal);
  });
  console.log("clicked");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "start"}, function(response) {
        // console.log(response.status);
      });
    });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "updateValues" && request.valueName === "InvitedTotal"){
        var name = String(request.valueName);
        var value = request.value;
        var total = 0;
        chrome.storage.local.get('InvitedTotal',function(data){
          console.log("1 data.InvitedTotal: "+data.InvitedTotal);
          console.log("2 value: "+value);
          console.log("3 name: "+name);
          total = value + parseInt(data.InvitedTotal);
          console.log("4 total: "+total);
          chrome.storage.local.set({'InvitedTotal':total},function(){
            console.log("InvitedTotal saved!");
          });
          $("#TotalInvited").text(total);
        });
    }

    if (request.action === "updateValues" && request.valueName === "ConnectCount"){
        var name = String(request.valueName);
        var value = request.value;
        var total = 0;
        chrome.storage.local.get('ConnectCount',function(data){
          console.log("1 data.ConnectCount: "+data.ConnectCount);
          console.log("2 value: "+value);
          console.log("3 name: "+name);
          chrome.storage.local.set({'ConnectCount':value},function(){
            console.log("ConnectCount saved!");
            console.log("5 data.ConnectCount: "+data.ConnectCount);
          });
          $("#CurrentPeriodConnect").text(value);

        });
    }

    if (request.action === "nextPage"){
      console.log("popup.js nextPage");
      setTimeout(function(){
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "start"}, function(response) {
            
          });
        });
      },5000);
    }

    if (request.action === "updateValues" && request.valueName === "Page"){
        var name = String(request.valueName);
        var value = request.value;
        var total = 0;
        chrome.storage.local.get('Page',function(data){
          console.log("1 data.Page: "+data.Page);
          console.log("2 value: "+value);
          console.log("3 name: "+name);
          total = value + parseInt(data.Page);
          console.log("4 total: "+total);
          chrome.storage.local.set({'Page':total},function(){
            console.log("Page saved!");
          });
        });
    }
});

$("#btnStop").click(function(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "stop"}, function(response) {
      console.log("stopping...");
    });
  });
});

$("#btnClear").click(function(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "clear"}, function(response) {
      console.log("Storage Cleared!");
      chrome.storage.local.clear();
    });
  });
});

$("#btnDisplay").click(function(){
  chrome.storage.local.get(['InvitedTotal','ConnectCount'],function(data){
    console.log("Display: "+ data.InvitedTotal);
    $("#TotalInvited").text(data.InvitedTotal);
    console.log("Display: "+ data.ConnectCount);
    $("#CurrentPeriodConnect").text(data.ConnectCount);
  });
});