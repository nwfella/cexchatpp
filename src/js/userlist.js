var UserList = function(options) {
  this.initialize(options);
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
    this.emit('add', values, this.name);
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
    this.removeUsers(value, save);
  },
  removeUsers: function(values, save) {
    this.emit('remove', values, this.name);
    var users = this.getUsers();
    users = _.without(users, values);
    this.setUsers(users, save);
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
