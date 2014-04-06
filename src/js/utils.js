var Utils = {}

/*
 * http://stackoverflow.com/questions/280634/endswith-in-javascript
 */
String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
}

String.prototype.startsWith = function(prefix) {
  return this.indexOf(prefix, this.length) === 0;
}

Utils.InitModalTemplate = function() {
  $('body').append('\
<script type="text/template" id="cexchat-modal-template">\
  <div id="<%= id %>" class="modal fade"><div class="modal-dialog">\
    <div class="modal-content">\
      <div class="modal-header">\
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
        <h4 class="modal-title"><%= title %></h4>\
      </div>\
      <div class="modal-body"><%= body %></div>\
      <div class="modal-footer">\
        <button type="button" class="btn btn-default" data-dismiss="modal"><% if (typeof closeButtonTitle !== "undefined") { %><%= closeButtonTitle %><% } else { %>Close<% } %></button>\
        <% if (typeof saveButtonTitle !== "undefined") { %><button type="button" class="btn btn-primary"><%= saveButtonTitle %></button><% } %>\
      </div>\
     </div>\
    </div>\
  </div>\
</script>');
}

Utils.AddModal = function(options) {
  var template = _.template($('#cexchat-modal-template').text());
  $('body').append(template(options));
  return $('#' + options.id);
}
