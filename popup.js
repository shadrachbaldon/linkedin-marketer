$("#button").click(function(){
  console.log("clicked");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "clicked"}, function(response) {
        console.log(response);
        // console.log(response.sent);
      });
    });
});