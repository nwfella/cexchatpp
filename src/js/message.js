var Message = function(options) {
  this.initialize(options);
}

Message.GetMessages = function() {
  return $('div.msgWindow .allMsg');
}

Message.GetMessagesForUser = function(user) {
  return $('div.msgWindow .allMsg .user:contains(' + user + ')').parent();
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

Message.RefreshMessages = function(settings, $messages) {
  var messages = Message.TranslateMessages($messages || Message.GetMessages(), settings);
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

      userList.toggleUser(username);

      _.each(Message.GetMessagesForUser(username), function(raw) {
        var message = Message.TranslateMessage($(raw));
        message.processActions([userList], reverse);
      });
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

    var that = this;
    var callback = function(e) {
      var formTemplate = _.template('<form class="form-horizontal"><%= value %></form>');
      var subjectTemplate = _.template('<div class="form-group"><input type="text" class="form-control" name="subject" value="<%= value %>"></div>');
      var bodyTemplate = _.template('<div class="form-group"><textarea class="form-control" name="body"><%= value %></textarea></div>');

      var body = 'Reporting the user for the following message(s) / reason(s): \n\n\t' + that.text();
      var modalBody = formTemplate({
        value: subjectTemplate({
          value: 'Reporting user: ' + that.username(),
        }) + bodyTemplate({
          value: body,
        }),
      });

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
    this.$username().click(function(e) {
      var username = that.username();
      MessageInput.AppendAndMoveToEnd('@' + username + ' ');
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

    this.processActions();
    this.processAutoAdds();

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

    else if (action === BaseSettings.ADD_CSS_CLASS) {
      if (reverse)
        this.clearCssClass(list.getCssClass());
      else
        this.setCssClass(list.getCssClass());
    }

  },
  processAutoAdds: function() {
    if (UserList.GetListsForUser(this.username(), this.settings).length !== 0) return;
    var lists = UserList.GetLists(this.settings);
    var that = this;
    _.each(lists, function(list) {
      that.processAutoAddsForList(list);
    });
  },
  processAutoAddsForList: function(list) {
    var autoAdds = list.getAutoAdds();
    var username = this.username();

    if (_.contains(autoAdds, BaseSettings.AUTOADD_ADDRESSES) && this.hasAddress()) {
      list.addUser(username);
      this.processActions([list]);
    }

    if (_.contains(autoAdds, BaseSettings.AUTOADD_REFERRAL_LINKS) && this.hasReferralLink()) {
      list.addUser(username);
      this.processActions([list]);
    }

    if (_.contains(autoAdds, BaseSettings.AUTOADD_SHORTENED_LINKS) && this.hasShortenedLink()) {
      list.addUser(username);
      this.processActions([list]);
    }

  },
  $text: function() {
    return this.$element.children('span.message-text');
  },
  text: function() {
    return this.$text().text();
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
  doRegexSearch: function(regex) {
    return this.text().search(regex) !== -1;
  },
  hasAddress: function() {
    return this.doRegexSearch(/[0-9a-zA-Z]{27,34}/);
  },
  hasReferralLink: function() {
    return this.doRegexSearch(/\/\?r=|cex\.io\/r\/|\?refid=|\?ref=|referral\//);
  },
  hasShortenedLink: function() {
    return this.doRegexSearch(/bit\.ly|goo\.gl|tinyurl\.com|tr\.im|ow\.ly|is\.gd|rdlnk\.co|bit\.do|mcaf\.ee|x\.co|dft\.ba|dyi\.li|v\.gd|gg\.gg|rdd\.me|shorten\.me|tiny\.tw|u\.to|shoutkey\.com|sze\.me|smplurl\.com|slink\.co|zbbx\.me|adf\.ly|b54\.in|adcrun\.ch|cpv\.li|cro\.pm|ukl\.me\.uk/);
  },
  clearCssClass: function(klass) {
    this.$element.removeClass(klass);
  },
  setCssClass: function(klass) {
    this.$element.addClass(klass);
  },
  $username: function() {
    return this.$element.children('span.user');
  },
  username: function() {
    return this.$username().text().replace(":", "").trim();
  },
  wrap: function() {
    var $messageElement = $('<span class="message-text"></span>');
    var $contents = this.$element.contents();
    var offset = this.buttonCount + 3;
    var $messageText = $contents.slice(offset, $contents.length);
    var messageText = $messageText.text();
    $messageText.wrapAll($messageElement);

    var mentions = _.uniq(messageText.match(/(^|[^a-z0-9_])@([a-z0-9_]+)/g) || []);
    var template = _.template('<span class="user mention"><%= user %></span>');
    if (mentions.length !== 0) {
      _.each(mentions, function(mention) {
        var $mention = template({user: mention});
        messageText = messageText.replace(mention, $mention);
      });

      var $element = this.$element.children('.message-text');
      $element.html(messageText);
      $element.children('.mention').click(function() {
        var username = $(this).text();
        MessageInput.AppendAndMoveToEnd(username + ' ');
      });
    }
  },
});
