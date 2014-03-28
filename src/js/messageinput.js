var MessageInput = function(options) {
  this.initialize(options);
}

MessageInput.GetMessageInput = function() {
    return $('textarea#msg');
}

MessageInput.GetInputText = function($input) {
    $input = $input || MessageInput.GetMessageInput();
    return $input.val();
}

MessageInput.SetInputText = function(text, $input) {
    $input = $input || MessageInput.GetMessageInput();
    $input.val(text);
}

MessageInput.AppendInputText = function(text, $input) {
    var value = MessageInput.GetInputText($input);

    if (!value.endsWith(' ') && value.length !== 0)
        value += ' ';

    value += text;
    MessageInput.SetInputText(value, $input);
}

MessageInput.AppendAndMoveToEnd = function(text, $input) {
    MessageInput.AppendInputText(text);
    MessageInput.FocusInputAndMoveToEnd();
}

/*
 * http://stackoverflow.com/questions/6003300/how-to-place-cursor-at-end-of-text-in-textarea-when-tabbed-into
 */
MessageInput.MoveCaretToEnd = function($input) {
    $input = $input || MessageInput.GetMessageInput();
    var input = $input[0];

    if (typeof input.selectionStart == "number")
        input.selectionStart = input.selectionEnd = input.value.length;

    else if (typeof input.createTextRange != "undefined") {
        input.focus();
        var range = input.createTextRange();
        range.collapse(false);
        range.select();
    }
}

MessageInput.FocusInputAndMoveToEnd = function($input) {
    $input = $input || MessageInput.GetMessageInput();
    $input.focus();
    MessageInput.MoveCaretToEnd($input);
}
