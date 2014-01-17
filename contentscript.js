/*
 * http://stackoverflow.com/questions/280634/endswith-in-javascript
 */
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/*
 * http://stackoverflow.com/questions/6003300/how-to-place-cursor-at-end-of-text-in-textarea-when-tabbed-into
 */
var moveCaretToEnd = function($element) {
    var element = $element[0];

    if (typeof element.selectionStart == "number")
        element.selectionStart = element.selectionEnd = element.value.length;

    else if (typeof element.createTextRange != "undefined") {
        element.focus();
        var range = element.createTextRange();
        range.collapse(false);
        range.select();
    }

}

var getMessageAction = function(callback) {
    chrome.storage.sync.get('CCPP_MESSAGE_ACTION', function(data) {
        callback(data.CCPP_MESSAGE_ACTION || 'dim');
    });
}

var setMessageAction = function(value) {
    chrome.storage.sync.set({
        CCPP_MESSAGE_ACTION: value,
    });
}

var getBlockedUsers = function(callback) {
    chrome.storage.sync.get('CCPP_BLOCKED_USERS', function(data) {
        callback(data.CCPP_BLOCKED_USERS || []);
    });
}

var storeBlockedUsers = function(users) {
    chrome.storage.sync.set({
        CCPP_BLOCKED_USERS: users
    });
}

var isBlocked = function(username, callback) {
    getBlockedUsers(function(users) {
        callback(users.indexOf(username) !== -1);
    });
}

var blockUsername = function(username) {
    getBlockedUsers(function(users) {

        if (users.indexOf(username) === -1)
            users.push(username);

        storeBlockedUsers(users);

    });
}

var unblockUsername = function(username) {
    getBlockedUsers(function(users) {

        var index = users.indexOf(username);
        if (index !== -1)
            users.splice(index, 1);

        storeBlockedUsers(users);
    });
}

var unblockUsernames = function(usernames) {
    getBlockedUsers(function(users) {

        _.each(usernames, function(username) {
            var index = users.indexOf(username);
            if (index !== -1)
                users.splice(index, 1);
        });

        storeBlockedUsers(users);
    });
}

var getMessageInput = function() {
    return $('textarea#msg');
}

var getInputText = function() {
    return getMessageInput().val();
}

var setInputText = function(text) {
    getMessageInput().val(text);
}

var appendInputText = function(text) {
    var value = getInputText();

    if (!value.endsWith(' '))
        value += ' ';

    value += text;
    setInputText(value);
}

var focusInputAndMoveToEnd = function() {
    var $input = getMessageInput();
    $input.focus();
    moveCaretToEnd($input);
}

var getMessages = function() {
    return $('div.msgWindow .allMsg');
}

var getMessagesWithoutButtons = function($messages) {
    return ($messages || getMessages()).not(':has(a.block-unblock-user)');
}

var getUsernames = function() {
    return _.uniq($('div.msgWindow .allMsg .user')
        .text()
        .replace(/ : /g, ',')
        .split(','));
}

var getUsername = function($element) {
    return $element.children('span.user').text().replace(":", "").trim();
}

var addBlockButton = function($element) {
    var $blocker = $('<a>')
        .addClass('block-unblock-user')
        .attr('title', 'block/unblock user')
        .append($('<i>').addClass('icn icn-shield'));

    $blocker.click(function(e) {

        var $parent = $(e.target).parents('.allMsg');
        var username = getUsername($parent);

        isBlocked(username, function(blocked) {

            if (blocked) {
                unblockUsername(username);
                unblockMessage(getBlockedMessages(username));
            } else {
                blockUsername(username);
                blockMessage(getUnblockedMessages(username));
            }

        });

    });

    $element.prepend($blocker);
}

var addToggleButton = function($element) {
    var $toggler = $('<a>')
        .addClass('toggle-message')
        .attr('title', 'show/hide the message')
        .append($('<i>').addClass('icn icn-list'));

    $toggler.click(function(e) {
        var $target = $(e.target);
        var $message = $target.parents('.allMsg').children('.message-text');
        $message.toggleClass('collapsed');

    });

    $element.prepend($toggler);
}

var setNameClickHandler = function($element) {
    $element.children('span.user').click(function(e) {
        var $username = $(e.target).parents('.allMsg');
        var username = getUsername($username);
        var $messageInput = getMessageInput();
        appendInputText('@' + username + ' ');
        focusInputAndMoveToEnd();
    });
}

var getUnblockedMessages = function(username) {
    return $('.allMsg:not(.blocked) .user:contains(' + username + ')').parent();
}

var getBlockedMessages = function(username) {
    return $('.allMsg.blocked .user:contains(' + username + ')').parent();
}

var wrapMessage = function($element) {
    var $messageElement = $('<span>')
        .addClass('message-text')
        .click(function(e) {
            var $target = $(e.target);
            setInputText('re: "' + $target.text() + '" ');
            focusInputAndMoveToEnd();
        });
    var $contents = $element.contents();
    $contents.slice(4, $contents.length).wrapAll($messageElement);
}

var wrapMessages = function($element) {
    $element.each(function(index, message) {
        wrapMessage($(message));
    });
}

var blockMessage = function($element) {
    getMessageAction(function(action) {
        if (action === 'dim') {
            $element.addClass('blocked');
            $element.children('span.message-text').addClass('collapsed');
        } else {
            console.log('hiding element');
            $element.hide();
        }
    });
}

var updateBlockedMessages = function() {
    getBlockedUsers(function(users) {
        _.each(users, function(user) {
            var $userMessages = getUnblockedMessages(user);
            blockMessage($userMessages);
        });
    });
}

var unblockMessage = function($element) {
    $element.removeClass('blocked');
    $element.children('span.message-text').removeClass('collapsed');
}

$(function() {
    var lastLength = 0;

    $(document).bind('DOMNodeInserted',function() {
        var $messages = getMessages();
        if ($messages.length <= lastLength) return;
        lastLength = $messages.length;

        updateBlockedMessages();

        $newMessages = getMessagesWithoutButtons($messages);
        setNameClickHandler($newMessages);
        addToggleButton($newMessages);
        addBlockButton($newMessages);
        wrapMessages($newMessages);
    });
});


