var PopupController = function(options) {
    this.initialize(options);
}

_.extend(PopupController.prototype, {
  initialize: function(options) {
    this.options = options;
    this.settings = ('settings' in this.options) ? this.options.settings : undefined;
  },
  initUserList: function(list, $select, $button) {
    var that = this;

    $select.change(function(e) {
      if ($select.children('option:selected').length !== 0)
        $button.removeAttr('disabled');
      else
        $button.attr('disabled', 'disabled');
    });

    $button.click(function(e) {
      var $selectedUsers = $select.children('option:selected');
      var selectedUsers = _.map($selectedUsers, function(user) {
        var value = $(user).val();
        return value === '' ? null : value;
      });

      that.removeUsers(list, selectedUsers);
      $selectedUsers.remove();
      $button.attr('disabled', 'disabled');
    });
  },
  initActionSettings: function(list) {
    list = this.settings.getList(list)
    var actions = list.getActions();
    var $inputs = $('input[name="message_action_' + list.name + '"]');

    var translate = function($input) {
      return $input.attr('name').split('message_action_')[1];
    }

    $inputs.each(function(index, input) {
      var $input = $(input);
      var action = $input.attr('value');

      if (_.contains(actions, action)) {
        $input.attr('checked', 'checked');
      }

      $input.change(function() {
        if ($input.is(':checked'))
          list.addAction($input.attr('value'));
        else
          list.removeAction($input.attr('value'));
      });

    });
  },
  initAutoAdd: function(list) {
    var autoadds = this.settings.getList(list).getAutoAdds();
    var $inputs = $('input[name^="autoadd_"][name$="' + list + '"]');

    var translate = function($input) {
      return $input.attr('name')
        .replace(/autoadd_/g, '')
        .replace(new RegExp('_' + list, 'g'), '');
    }

    $inputs.each(function(index, input) {
      var $input = $(input);
      var autoadd = translate($input);

      if (_.contains(autoadds, autoadd))
        $input.attr('checked', 'checked');
    });
  },
  initMiscSettings: function(list) {
    var $element = $('input[type="checkbox"][name="show_icon_' + list + '"]');

    $element.removeAttr('checked');
    if (this.settings.getList(list).getShowIcon(true))
      $element.attr('checked', 'checked');

    var userList = this.settings.getList(list);

    $element.change(function() {
      userList.setShowIcon($element.is(':checked'));
    });

    $element = $('input[type="text"][name="css_class_' + list + '"]');
    $element.val(userList.getCssClass());

    $element.blur(function() {
      var val = $element.val();
      userList.setUsernameColor(val);
    });
  },
  initAll: function() {
    var lists = this.settings.getLists();
    var that = this;
    _.each(lists, function(list) {
      that.initSection(list);
    });

    $editor = $('textarea[name="css"]');
    console.log(this.settings.data.css.value);
    $editor.val(this.settings.data.css.value);
    var editor = CodeMirror.fromTextArea($editor[0], {
      autofocus: true,
      lineNumbers: true,
      mode: 'css',
    });

    editor.on('change', function() {
      that.settings.data.css = editor.getValue();
    });

    $("#action_clear_settings").click(function() {
      console.log('clearing settings');
      chrome.storage.sync.clear();
    });
  },
  initSection: function(list) {
    var $select = $('select[name=users_' + list + ']');
    var $removeButton = $('#action_remove_' + list);

    this.updateListActions(list);
    this.updateListUsers(list, $select);
    this.initUserList(list, $select, $removeButton);
    this.initActionSettings(list);
    this.initAutoAdd(list);
    this.initMiscSettings(list);
  },
  getActions: function(list) {
    return this.settings.getList(list).getActions();
  },
  getUsers: function(list) {
    return this.settings.getList(list).getUsers();
  },
  removeUsers: function(list, users) {
    this.settings.getList(list).removeUsers(users);
  },
  updateListActions: function(list) {
    var actions = this.getActions(list);

    $('input[name=message_action_' + list + '][checked=checked]').removeAttr('checked');

    _.each(actions, function(action) {
      $('input[name=message_action_' + list + '][value="' + action + '"]').attr('checked', 'checked');
    });
  },
  updateListUsers: function(list, $select) {
    $select.empty();
    var users = this.getUsers(list);
    _.each(users, function(user) {
      var $option = $('<option>')
        .val(user)
        .text(user);
      $select.append($option);
    });
  },
});
