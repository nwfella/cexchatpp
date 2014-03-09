var Emitter = function(options) {
  this.initialize(options);
}

_.extend(Emitter.prototype, {
  initialize: function(options) {
    this.options = options;
    this.listeners = {}
  },
  emit: function(signal) {
    var listeners = this.listeners || {};
    var args = _.without(arguments, signal);
    listeners[signal] = _.filter(listeners[signal], function(listener) {
      return listener !== null && typeof listener !== 'undefined';
    });

    _.each(this.listeners[signal] || [], function(listener) {
      listener.apply(listener, args);
    });
  },
  on: function(signal, callback) {
    var listeners = this.listeners || {};
    if (typeof listeners[signal] === 'undefined')
      listeners[signal] = [callback];
    else
      listeners[signal].push(callback);

    listeners[signal] = _.filter(listeners[signal], function(listener) {
      return listener !== null && typeof listener !== 'undefined';
    });
  },
});
