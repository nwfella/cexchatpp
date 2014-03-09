$(function() {
  var settings = BaseSettings.GetSettings();
  var controller = new PopupController({
    settings: settings,
  });

  settings.on('load', function(data, obj) {
    var lists = settings.getLists();
    _.each(lists, function(list) {
      controller.initSection(list);
    });
  });

  settings.load();
});
