var ChatController = function(options) {
  this.initialize(options);
}

_.extend(ChatController.prototype, {
  initialize: function(options) {
    this.options = options || {};
    this.settings = ('settings' in this.options) ? this.options.settings : undefined;
    Utils.InitModalTemplate();
  },
  cycle: function() {
    var $messages = Message.GetMessages();

    if ($messages.length <= this.lastLength) return;
    this.lastLength = $messages.length;

    $messages = Message.GetUnrwappedMessages($messages);
    Message.SetupMessages($messages, this.settings);
  },
  reload: function() {
    Message.RefreshMessages(this.settings);
  },
});
