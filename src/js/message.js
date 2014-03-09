var Message = function(options) {
  this.initialize(options);
}

Message.GetMessages = function() {
  return $('div.msgWindow .allMsg');
}

Message.GetMessagesWithoutButtons = function($messages) {
  return ($messages || Message.GetMessages()).not(':has(a.block-unblock-user)');
}

Message.GetUnblockedMessages = function(username) {
  var $elements = $('.allMsg:not(.blocked) .user:contains(' + username + ')').parent();
  return Message.TranslateMessages($elements);
}

Message.GetBlockedMessages = function(username) {
  var $elements = $('.allMsg.blocked .user:contains(' + username + ')').parent();
  return Message.TranslateMessages($elements);
}

Message.GetUsernames = function() {
  return _.uniq($('div.msgWindow .allMsg .user')
    .text()
    .replace(/ : /g, ',')
    .split(','));
}

Message.SetupMessages = function($elements, settings) {
  _.each($elements, function(element) {
    var message = Message.TranslateMessage($(element), settings);
    message.setup();
  });
}

Message.TranslateMessage = function($element, settings) {
  settings = settings || BaseSettings.GetSettings();
  return new Message({
    '$element': $element,
    'settings': settings,
  });
}

Message.TranslateMessages = function($elements, settings) {
  return _.map($elements, function(element) {
    return Message.TranslateMessage($(element), settings);
  });
}

Message.UpdateBlockedMessages = function(settings) {
  var users = settings.GetBlockedUsers();
  _.each(users, function(user) {
    var messages = Message.GetUnblockedMessages(user);
    _.each(messages, function(index, message) {
      message.block();
    });
  });
}

_.extend(Message.prototype, {
  initialize: function(options) {
    this.options = options || {};
    this.$element = ('$element' in this.options) ? this.options.$element : undefined;
    this.settings = ('settings' in this.options) ? this.options.settings : undefined;
  },
  addButton: function(options, callback) {
    options = options || {}

    var $button = $(options.tagName || '<a>')
      .addClass(options.className)
      .append(
        $(options.iconTagName || '<i>')
          .addClass(options.iconBaseClassName || 'icn')
          .addClass(options.iconClassName));

    _.each(options.attrs || {}, function(value, key) {
      $button.attr(key, value);
    });

    if (typeof callback !== 'undefined')
      $button.click(callback);

    var $element = (options.$element || this.$element);

    if (typeof options.action === 'undefined' || options.action === 'prepend')
      $element.prepend($button);
    else if (options.action === 'before')
      $element.before($button);
    else if (options.action === 'after')
      $element.after($button);

    return $button;
  },
  addListToggleButton: function(list, options, callback) {
    var that = this;
    callback = callback || function(e) {
      that.settings.getList(list).toggleUser(that.username());
    }

    this.addButton(options, callback);
  },
  addBlockButton: function() {
    this.addListToggleButton('block', {
      className: 'block-unblock-user',
      iconClassName: 'icn-support-2',
      attrs: {
        title: 'block/unblock user',
      },
    });
  },
  addAddUserButton: function() {
    var options = {
      className: 'add-remove-user',
      iconClassName: 'icn-ref',
      attrs: {
        title: 'add/remove user from list',
      },
    }

    var callback = function(e) {
      console.log('add remove user')
    }

    this.addButton(options, callback);
  },
  addFriendButton: function() {
    this.addListToggleButton('friend', {
      className: 'friend-user',
      iconClassName: 'icn-star',
      attrs: {
        title: 'friend/unfriend user',
      },
    });
  },
  addReportButton: function() {
    var options = {
      className: 'report-user pull-right',
      iconClassName: 'icn-support',
      $element: this.$element.children('span.time'),
      action: 'after',
      attrs: {
        title: 'report user',
      },
    }

    var callback = function(e) {
      var modalBody = '<form class="form-horizontal" role="form">';
      modalBody += '<div class="form-group"><textarea class="form-control" rows="3"></textarea></div></form>';
      var $modal = Utils.AddModal({
        id: 'report-user-modal',
        body: modalBody,
        title: 'Report User',
        closeButtonTitle: 'Cancel',
        saveButtonTitle: 'Report',
      });

      $modal.modal({
        show: true,
      });
    }

    this.addButton(options, callback);
  },
  addSpamButton: function() {
    this.addListToggleButton('spam', {
      className: 'spam-user',
      iconClassName: 'icn-shield',
      attrs: {
        title: 'mark/unmark user as spam',
      },
    });
  },
  addToggleButton: function() {
    var options = {
      className: 'toggle-message',
      iconClassName: 'icn-list',
      attrs: {
        title: 'show/hide the message',
      },
    }

    var that = this;
    var callback = function(e) {
      that.toggleCollapse();
    }

    this.addButton(options, callback);
  },
  setNameClickHandler: function() {
    var that = this;
    this.$element.children('span.user').click(function(e) {
      var username = that.username();
      MessageInput.AppendInputText('@' + username + ' ');
      MessageInput.FocusInputAndMoveToEnd();
    });
  },
  setup: function() {
    if (this.settings.data.adduser.showicon)
      this.addAddUserButton();

    if (this.settings.data.friends.showicon)
      this.addFriendButton();

    if (this.settings.data.spam.showicon)
      this.addSpamButton();

    if (this.settings.data.report.showicon)
      this.addReportButton();

    if (this.settings.data.block.showicon)
      this.addBlockButton();

    if (this.settings.data.toggle.showicon)
      this.addToggleButton();

    this.setNameClickHandler();
    this.wrap();
  },
  $text: function() {
    return this.$element.children('span.message-text');
  },
  collapse: function() {
    this.$text().addClass('collapsed');
  },
  expand: function() {
    this.$text().removeClass('collapsed');
  },
  isCollapsed: function() {
    return this.$text().hasClass('collapsed');
  },
  toggleCollapse: function() {
    if (this.isCollapsed())
      this.expand();
    else
      this.collapse();
  },
  username: function() {
    return this.$element.children('span.user').text().replace(":", "").trim();
  },
  wrap: function() {
    var $messageElement = $('<span>')
      .addClass('message-text');
    var $contents = this.$element.contents();
    var offset = 9;
    $contents.slice(offset, $contents.length).wrapAll($messageElement);
  },
});
