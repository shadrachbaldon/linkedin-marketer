$("#button").click(function(){
  console.log("clicked");
    // chrome.runtime.sendMessage({action:"clicked"}, function(response){
    //   console.log(response.status);
    // });
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "clicked"}, function(response) {
        console.log(response.status);
      });
    });
});