var ChromeSettings = function(options) {
  this.initialize(options);
}

_.extend(ChromeSettings.prototype, BaseSettings.prototype);
_.extend(ChromeSettings.prototype, ChromeEmitter.prototype);
_.extend(ChromeSettings.prototype, {
  initialize: function(options) {
    BaseSettings.prototype.initialize.apply(this, arguments);
    ChromeEmitter.prototype.initialize.apply(this, arguments);

    var that = this;
    this.on('save', function(data) {
      that.onSave(data);
    });
  },
  load: function(signal) {
    var that = this;
    chrome.storage.sync.get(null, function(values) {
      that.loadValues(values, signal || 'load');
    });
  },
  save: function() {
    var saveData = this.makeSaveData();

    chrome.storage.sync.clear();
    chrome.storage.sync.set(saveData);

    // NOTE: chrome storage set is async
    this.emit('save', saveData);
  },
  onMessage: function(message) {
    if (message.action === 'settings:save')
      this.load('reload');
  },
  onSave: function(data) {
    this.sendMessage({
      action: 'settings:save',
      data: data,
    });
  },
});
