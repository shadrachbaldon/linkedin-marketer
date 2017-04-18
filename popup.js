// chrome.storage.local.get(['InvitedTotal','ConnectCount'], function(data) {
//   console.log("initialize variables");
//   if (typeof data.InvitedTotal === 'undefined') {
//     $("#TotalInvited").text("0");
//   }else{
//     $("#TotalInvited").text(data.InvitedTotal);
//   }
//   if (typeof data.ConnectCount === 'undefined') {
//     $("#CurrentPeriodConnect").text("0");
//   }else{
//     $("#CurrentPeriodConnect").text(data.ConnectCount);
//   }
// });
// $("#nextPeriodWrap").hide();

// $("#btnStart").click(function(){
//   chrome.storage.local.get('InvitedTotal', function(result) {
//     console.log(result.InvitedTotal);
//   });
//   console.log("clicked");
//   $("#Status").text("Connecting new contacts"); // change the status display
//   $(this).attr("disabled","disabled");
//     // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     //   chrome.tabs.sendMessage(tabs[0].id, {action: "reloadPage"});
//     // });
//     // setTimeout(function(){
//     //   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     //     chrome.tabs.sendMessage(tabs[0].id, {action: "start"});
//     //   });
//     // },5000);
// });

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if (request.action === "updateValues" && request.valueName === "InvitedTotal"){
//         var name = String(request.valueName);
//         var value = request.value;
//         var total = 0;
//         chrome.storage.local.get('InvitedTotal',function(data){
//           total = value + parseInt(data.InvitedTotal);
//           chrome.storage.local.set({'InvitedTotal':total},function(){
//           });
//           $("#TotalInvited").text(total);
//         });
//     }

//     if (request.action === "updateValues" && request.valueName === "ConnectCount"){
//         var name = String(request.valueName);
//         var value = request.value;
//         var total = 0;
//         chrome.storage.local.get('ConnectCount',function(data){
//           total = value + parseInt(data.ConnectCount);
//           chrome.storage.local.set({'ConnectCount':total},function(){
//           });
//           $("#CurrentPeriodConnect").text(total);

//         });
//     }

//     if (request.action === "nextPage"){
//       console.log("popup.js nextPage");
//       setTimeout(function(){
        
//         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//           chrome.tabs.sendMessage(tabs[0].id, {action: "start"});
//         });
//       },5000);
//     }

//     if (request.action === "standBy") {
//       $("#nextPeriodWrap").show();
//       $("#Status").text("Waiting for the next period"); //change the status display
//       $("#nextPeriodCount").countdowntimer({
//         hours:0,
//         minutes:0,
//         seconds:10,
//         timeUp: function(){
//           console.log("Moving to next period.");
//           $("#nextPeriodWrap").hide();
//           $("#Status").text("Connecting new contacts..");
//           chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//             chrome.tabs.sendMessage(tabs[0].id, {action: "navigateToLastPage"});
//           });
//           setTimeout(function(){
//             chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//               chrome.tabs.sendMessage(tabs[0].id, {action: "start"});
//             });
//           },5000);
//         }
//       });

//     }

//     if (request.action === "updateValues" && request.valueName === "Page"){
//         var name = String(request.valueName);
//         var value = request.value;
//         var total = 0;
//         chrome.storage.local.get('Page',function(data){
//           console.log("1 data.Page: "+data.Page);
//           console.log("2 value: "+value);
//           console.log("3 name: "+name);
//           total = value + parseInt(data.Page);
//           console.log("4 Page total: "+total);
//           chrome.storage.local.set({'Page':total},function(){
//             console.log("Page saved!");
//             console.log("Page new value: "+data.Page);
//             console.log("Total after set: "+total);
//           });
//         });
//     }
// });

// $("#btnStop").click(function(){
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     chrome.tabs.sendMessage(tabs[0].id, {action: "stop"}, function(response) {
//       console.log("stopping...");
//     });
//   });
// });

$("#btnClear").click(function(){
  chrome.storage.local.clear();
  console.log("cleared");
});

// $("#btnDisplay").click(function(){
//   chrome.storage.local.get(['InvitedTotal','ConnectCount','Page'],function(data){
//     console.log("Display: "+ data.InvitedTotal);
//     $("#TotalInvited").text(data.InvitedTotal);
//     console.log("Display: "+ data.ConnectCount);
//     $("#CurrentPeriodConnect").text(data.ConnectCount);
//     console.log("Display: "+ data.Page);
//   });
// });