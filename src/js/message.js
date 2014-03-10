var Message = function(options) {
  this.initialize(options);
}

Message.GetMessages = function() {
  return $('div.msgWindow .allMsg');
}

Message.GetUnrwappedMessages = function($messages) {
  return ($messages || Message.GetMessages()).not(':has(span.message-text)');
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

Message.RefreshMessages = function(settings) {
  var messages = Message.TranslateMessages(Message.GetMessages(), settings);
  _.each(messages, function(message) {
    message.refresh();
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

_.extend(Message.prototype, {
  buttonCount: 0,
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

    this.buttonCount += 1;

    return $button;
  },
  removeButton: function(className) {
    this.$element.children('a.' + className).remove();
    this.buttonCount -= 1;
  },
  addListToggleButton: function(list, options, callback) {
    var that = this;
    callback = callback || function(e) {
      var userList = that.settings.getList(list);
      var username = that.username();
      var reverse = userList.hasUser(username);

      // that.processActions([userList], reverse);
      userList.toggleUser(username);
      Message.RefreshMessages(that.settings);
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
  removeBlockButton: function() {
    this.removeButton('block-unblock-user');
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
  removeAddUserButton: function() {
    this.removeButton('add-remove-user');
  },
  addFriendButton: function() {
    this.addListToggleButton('friends', {
      className: 'friend-user',
      iconClassName: 'icn-star',
      attrs: {
        title: 'friend/unfriend user',
      },
    });
  },
  removeFriendButton: function() {
    this.removeButton('friend-user');
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
      modalBody += '<div class="form-group"><input type="text" class="form-control" name="subject"></div>';
      modalBody += '<div class="form-group"><textarea class="form-control" name="body" rows="7"></textarea></div></form>';
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
  removeReportButton: function() {
    this.removeButton('report-user');
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
  removeSpamButton: function() {
    this.removeButton('spam-user');
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
  removeToggleButton: function() {
    this.removeButton('toggle-message');
  },
  setNameClickHandler: function() {
    var that = this;
    this.$element.children('span.user').click(function(e) {
      var username = that.username();
      MessageInput.AppendInputText('@' + username + ' ');
      MessageInput.FocusInputAndMoveToEnd();
    });
  },
  refresh: function() {
    if (!this.settings.data.adduser.showicon)
      this.removeAddUserButton();

    if (!this.settings.data.friends.showicon)
      this.removeFriendButton();

    if (!this.settings.data.spam.showicon)
      this.removeSpamButton();

    if (!this.settings.data.report.showicon)
      this.removeReportButton();

    if (!this.settings.data.block.showicon)
      this.removeBlockButton();

    if (!this.settings.data.toggle.showicon)
      this.removeToggleButton();

    this.processActions(undefined, true);
    this.processActions(undefined);
  },
  setup: function(refresh) {
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

    this.processActions();
  },
  processActions: function(lists, reverse) {
    var username = this.username();

    if (typeof lists === 'undefined') {
      lists = UserList.GetListsForUser(username, this.settings);
      var listNames = _.map(lists, function(list) {return list.name});

      if (_.contains(listNames, 'block') && _.contains(listNames, 'spam'))
        listNames = _.without(listNames, 'spam');

      if (_.contains(listNames, 'block') && _.contains(listNames, 'friends'))
        listNames = _.without(listNames, 'block');

      lists = _.filter(lists, function(list) {
        return _.contains(listNames, list.name);
      });
    }

    var that = this;
    _.each(lists, function(list) {
      var actions = list.getActions();
      _.each(actions, function(action) {
        that.processAction(action, reverse, list);
      });
    });
  },
  processAction: function(action, reverse, list) {
    reverse = typeof reverse === 'undefined' ? false : reverse;

    if (action === BaseSettings.ACTION_HIDE)
      if (reverse)
        this.show();
      else
        this.hide();

    else if (action === BaseSettings.ACTION_COLLAPSE)
      if (reverse)
        this.expand();
      else
        this.collapse();

    else if (action === BaseSettings.CHANGE_COLOR_USERNAME) {
      if (reverse)
        this.clearUsernameColor();
      else
        this.setUsernameColor(list.getUsernameColor());
    }
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
  hide: function() {
    this.$element.hide();
  },
  show: function() {
    this.$element.show();
  },
  isHidden: function() {
    return this.$element.visible();
  },
  toggleHidden: function() {
    if (this.isHidden())
      this.show();
    else
      this.hide();
  },
  hasAddress: function() {
    return this.message().search(/\w{27,34}/) !== -1;
  },
  hasReferralLink: function() {
    return this.message().search(/\/\?r=|cex\.io\/r\/|\?refid=/) !== -1;
  },
  hasShortenedLink: function() {
    return this.message().search(/bit\.ly|goo\.gl|tinyurl\.com|tr\.im|ow\.ly|is\.gd|rdlnk\.co|bit\.do|mcaf\.ee|x\.co|dft\.ba|dyi\.li|v\.gd|gg\.gg|rdd\.me|shorten\.me|tiny\.tw|u\.to|shoutkey\.com|sze\.me|smplurl\.com|slink\.co|zbbx\.me|adf\.ly|b54\.in|adcrun\.ch|cpv\.li|cro\.pm|ukl\.me\.uk/) !== -1;
  },
  clearUsernameColor: function() {
    var $username = this.$username();
    // $username.css('color', '');
    $username.removeAttr('style');
    // console.log('clearUsernameColor', $username.css('color'));
  },
  setUsernameColor: function(color) {
    this.$username().css('color', color);
  },
  $username: function() {
    return this.$element.children('span.user');
  },
  username: function() {
    return this.$username().text().replace(":", "").trim();
  },
  wrap: function() {
    var $messageElement = $('<span>')
      .addClass('message-text');
    var $contents = this.$element.contents();
    var offset = this.buttonCount + 2;
    $contents.slice(offset, $contents.length).wrapAll($messageElement);
  },
});
