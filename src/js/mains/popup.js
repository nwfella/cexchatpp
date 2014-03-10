$(function() {
  var settings = BaseSettings.GetSettings();
  var controller = new PopupController({
    settings: settings,
  });

  settings.on('load', function(data, obj) {
    controller.initAll();
  });

  settings.load();
});
