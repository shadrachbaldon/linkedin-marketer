$("#button").click(function(){
  chrome.storage.local.get('InvitedTotal', function(result) {
    console.log(result.InvitedTotal);
  });
  console.log("clicked");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "clicked"}, function(response) {
        // console.log(response.status);
      });
    });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // sendResponse({status: request.action});
    if (request.action === "updateValues"){
        var name = String(request.valueName);
        var value = request.value;
        chrome.storage.local.set({name: value});
        var test = "--";
        chrome.storage.local.get('InvitedTotal',function(data){
          test = data.InvitedTotal;
          console.log(data.InvitedTotal);
          console.log(test);
        });
        sendResponse({status: test});
    }
});