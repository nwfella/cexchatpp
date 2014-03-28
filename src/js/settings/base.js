var BaseSettings = function(options) {
  this.initialize(options);
}

BaseSettings.GetSettings = function() {
  return new ChromeSettings();
}

BaseSettings.AUTOADD_ADDRESSES = 'addresses';
BaseSettings.AUTOADD_SHORTENED_LINKS = 'shortened_links';
BaseSettings.AUTOADD_REFERRAL_LINKS = 'referral_links';

BaseSettings.ADD_CSS_CLASS = 'css:username';

BaseSettings.ACTION_COLLAPSE = 'do:collapse';
BaseSettings.ACTION_HIDE = 'do:hide';

_.extend(BaseSettings.prototype, Emitter.prototype);
_.extend(BaseSettings.prototype, {
  defaults: {
    block: {
      actions: [BaseSettings.ACTION_HIDE, BaseSettings.ADD_CSS_CLASS],
      autoadds: [],
      showicon: true,
      users: [
        'quinnendu1',
        'hannibalatthegate',
        'ilaydaine',
      ],
      cssclass: 'block',
    },
    friends: {
      actions: [BaseSettings.ADD_CSS_CLASS],
      autoadds: [],
      showicon: true,
      users: [],
      cssclass: 'friends',
    },
    spam: {
      actions: [BaseSettings.ACTION_COLLAPSE, BaseSettings.ADD_CSS_CLASS],
      autoadds: [
        BaseSettings.AUTOADD_ADDRESSES,
        BaseSettings.AUTOADD_SHORTENED_LINKS,
        BaseSettings.AUTOADD_REFERRAL_LINKS,
      ],
      showicon: true,
      users: [],
      cssclass: 'spam',
    },
    adduser: {
      showicon: false,
    },
    report: {
      showicon: true,
    },
    toggle: {
      showicon: true,
    },
    css: {
      value: '\
.friends span.user {\n\
  color: rgb(144, 238, 144)\n\
}\n\
\n\
.spam span.user {\n\
  color: rgb(255, 165, 0)\n\
}\n\
\n\
.blocked span.user {\n\
  color: rgb(44, 176, 176);\n\
}\n',
    }
  },
  initialize: function(options) {
    Emitter.prototype.initialize.apply(this, arguments);

    this.options = options || {};
    this.data = ('data' in this.options) ? this.options.data : {};
  },
  get: function(key, defaultValue) {
    return this.data[key] || defaultValue;
  },
  set: function(key, value, save) {
    this.data[key] = value;
    this.emit('change:' + key, save);

    if ((save === 'undefined') ? true : save)
      this.save();
  },
  getLists: function() {
    return _.uniq(_.keys(this.data));
  },
  getList: function(list) {
    var userList = new UserList({
      name: list,
      data: this.data[list] || {},
      settings: this,
    });
    return userList;
  },
  getListAndSubsection: function(key) {
    return key.split('_');
  },
  makeListAndSubsection: function(key, subsection) {
    return key + '_' + subsection;
  },
  loadValues: function(values, signal) {
    var that = this;
    var keys = _.keys(values);
    _.each(keys, function(key) {
      var raw = that.getListAndSubsection(key);

      var list = raw[0];
      var subsection = raw[1];
      var value = values[key];

      if (key === 'CCPP_BLOCKED_USERS') {
        if (typeof that.data.block === 'undefined')
          that.data.block = {}

        if (typeof that.data.block.users === 'undefined')
          that.data.block.users = []

        that.data.block.users = _.union(value, that.data.block.users);
        return;
      }

      if (key === 'CCPP_MESSAGE_ACTION') {
        if (typeof that.data.block === 'undefined')
          that.data.block = {}

        if (typeof that.data.block.action === 'undefined')
          that.data.block.action = value;
      }

      if (typeof that.data[list] === 'undefined')
        that.data[list] = {}

      if (list === 'block' && subsection === 'users'  && typeof that.data.block.users !== 'undefined')
        that.data.block.users = _.uniq(that.data.block.users.concat(value));
      else
        that.data[list][subsection] = value;
    });
    this.data = _.extend({}, this.defaults, this.data);
    this.emit(signal || 'load', this.data, this);
  },
  makeSaveData: function() {
    var that = this;
    var saveData = {}
    _.each(this.data, function(value, key) {
      _.each(value, function(subValue, subKey) {
        var storeKey = that.makeListAndSubsection(key, subKey);
        saveData[storeKey] = subValue;
      });
    });
    return saveData;
  },
});
