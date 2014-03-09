var ChromeSettings = function(options) {
  this.initialize(options);
}

_.extend(ChromeSettings.prototype, BaseSettings.prototype);
_.extend(ChromeSettings.prototype, {
  load: function() {
    var that = this;
    chrome.storage.sync.get(null, function(values) {
      that.loadValues(values);
    });
  },
  save: function() {
    var saveData = {};
    var that = this;
    _.each(this.data, function(value, key) {
      _.each(value, function(subValue, subKey) {
        var storeKey = that.makeListAndSubsection(key, subKey);
        saveData[storeKey] = subValue;
      });
    });

    chrome.storage.sync.clear();
    chrome.storage.sync.set(saveData);

    // NOTE: chrome storage set is async
    this.emit('save');
  },
});
