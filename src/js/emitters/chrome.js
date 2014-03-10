var ChromeEmitter = function(options) {
  this.initialize(options);
}

_.extend(ChromeEmitter.prototype, Emitter.prototype);
_.extend(ChromeEmitter.prototype, {
  initialize: function(options) {
    Emitter.prototype.initialize.apply(this, arguments);

    var that = this;
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      that.onMessage(request);
      sendResponse({status: 'OK'});
    });
  },
  sendMessage: function(message) {
    if (typeof chrome.tabs !== 'undefined')
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
        chrome.tabs.sendMessage(tabs[0].id, message);
      });
  },
});
