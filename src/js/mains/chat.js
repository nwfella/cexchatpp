$(function() {
  var lastLength = 0;

  var settings = BaseSettings.GetSettings();
  var controller = new ChatController({
    settings: settings,
  });

  settings.on('load', function() {
    $(document).bind('DOMNodeInserted',function() {
      controller.cycle();
    });
  });

  settings.on('reload', function() {
    controller.reload();
  });

  settings.load();
});
