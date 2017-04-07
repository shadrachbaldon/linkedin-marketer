$("#btnStart").click(function(){
  chrome.storage.local.get('InvitedTotalToday', function(result) {
    console.log(result.InvitedTotalToday);
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
    if (request.action === "updateValues" && request.valueName === "InvitedTotalToday"){
        var name = String(request.valueName);
        var value = request.value;
        var total = 0;
        chrome.storage.local.get('InvitedTotalToday',function(data){
          console.log("1 data.InvitedTotalToday: "+data.InvitedTotalToday);
          console.log("2 value: "+value);
          console.log("3 name: "+name);
          total = value + parseInt(data.InvitedTotalToday);
          console.log("4 total: "+total);
          chrome.storage.local.set({'InvitedTotalToday':total},function(){
            console.log("saved!");
          });
          $("#TotalInvitedToday").text(data.InvitedTotalToday);
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

$("#btnDisplay").click(function(){
  chrome.storage.local.get('InvitedTotalToday',function(data){
    console.log("Display: "+ data.InvitedTotalToday);
    $("#TotalInvitedToday").text(data.InvitedTotalToday);
  });
});