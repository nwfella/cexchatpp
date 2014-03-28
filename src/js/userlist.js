var UserList = function(options) {
  this.initialize(options);
}

UserList.GetListsForUser = function(user, settings) {
  var listNames = settings.getLists();
  var lists = [];

  _.each(listNames, function(listName) {
    var list = settings.getList(listName);
    var users = list.getUsers();

    if (_.contains(users, user))
      lists.push(list);
  });

  return lists;
}

UserList.GetLists = function(settings) {
  return _.map(settings.getLists(), function(listName) {
    return settings.getList(listName);
  });
}

UserList.ACTION_COLLAPSE = BaseSettings.ACTION_COLLAPSE;
UserList.ACTION_HIDE = BaseSettings.ACTION_HIDE;
UserList.ACTIONS_DEFAULT = [UserList.ACTION_HIDE];

_.extend(UserList.prototype, Emitter.prototype);
_.extend(UserList.prototype, {
  initialize: function(options) {
    Emitter.prototype.initialize.apply(this, arguments);

    this.options = options || {};
    this.name = ('name' in this.options) ? this.options.name : undefined;
    this.data = ('data' in this.options) ? this.options.data : undefined;
    this.settings = ('settings' in this.options) ? this.options.settings : undefined;
  },
  getSubsectionValue: function(subsection) {
    return this.data[subsection];
  },
  setSubsectionValue: function(subsection, value, save) {
    this.data[subsection] = value;
    this.settings.set(this.name, this.data);

    if (typeof save === 'undefined' ? true : save)
      this.settings.save();
  },
  getActions: function() {
    return this.getSubsectionValue('actions');
  },
  setActions: function(value, save) {
    this.setSubsectionValue('actions', value, save);
  },
  hasAction: function(action, actions) {
    return _.contains((actions || this.getActions()), action);
  },
  addAction: function(value, save) {
    this.addActions([value], save);
  },
  addActions: function(values, save) {
    this.emit('add:actions', values, this.name);
    var actions = this.getActions();
    actions = _.union(values, actions);
    actions = _.filter(actions, function(action) {
      return action.indexOf('do') === -1 ? true : _.contains(values, action);
    });
    this.setActions(actions, save);
  },
  removeAction: function(value, save) {
    this.removeActions([value], save);
  },
  removeActions: function(values, save) {
    var actions = _.filter(this.getActions(), function(action) {
      return !_.contains(values, action);
    });
    this.setActions(actions, save);
    this.emit('remove:actions', values, this.name);
  },
  toggleAction: function(value, save) {
    if (this.hasAction(value))
      this.removeAction(value, save)
    else
      this.addAction(value, save);
  },
  toggleActions: function(values, save) {
    if (this.hasActions(values))
      this.removeActions(values, save)
    else
      this.addActions(values, save);
  },
  getAutoAdds: function() {
    return this.getSubsectionValue('autoadds');
  },
  setAutoAdds: function(value, save) {
    this.setSubsectionValue('autoadds', value, save);
  },
  getShowIcon: function() {
    return this.getSubsectionValue('showicon');
  },
  setShowIcon: function(value, save) {
    this.setSubsectionValue('showicon', value, save);
  },
  getCssClass: function() {
    return this.getSubsectionValue('cssclass');
  },
  setCssClass: function(value, save) {
    this.setSubsectionValue('cssclass', value, save);
  },
  getUsers: function() {
    return this.getSubsectionValue('users');
  },
  setUsers: function(value, save) {
    this.setSubsectionValue('users', value, save);
  },
  addUser: function(value, save) {
    this.addUsers([value], save);
  },
  addUsers: function(values, save) {
    this.emit('add:users', values, this.name);
    var users = this.getUsers();
    users = _.union(values, users);
    this.setUsers(users, save);
  },
  hasUser: function(value) {
    return _.contains(this.getUsers(), value);
  },
  hasUsers: function(values) {
    return _.intersection(values, this.getUsers()).length === values.length;
  },
  removeUser: function(value, save) {
    this.removeUsers([value], save);
  },
  removeUsers: function(values, save) {
    var users = _.filter(this.getUsers(), function(user) {
      return !_.contains(values, user);
    });
    this.setUsers(users, save);
    this.emit('remove:users', values, this.name);
  },
  toggleUser: function(value, save) {
    if (this.hasUser(value))
      this.removeUser(value, save)
    else
      this.addUser(value, save);
  },
  toggleUsers: function(values, save) {
    if (this.hasUsers(values))
      this.removeUsers(values, save)
    else
      this.addUsers(values, save);
  },
});
