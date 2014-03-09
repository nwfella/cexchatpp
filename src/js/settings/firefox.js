var FirefoxSettings = function(options) {
  this.initialize(options);
}

_.extend(FirefoxSettings.prototype, BaseSettings.prototype);
_.extend(FirefoxSettings.prototype, {
  load: function() {},
  save: function() {
    this.emit('save');
  },
});
