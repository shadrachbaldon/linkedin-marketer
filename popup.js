$("#btnClear").click(function(){
  chrome.storage.local.clear();
  console.log("cleared");
});