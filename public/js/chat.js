var io = io.connect();
var state;
var visibilityChange;
var fehler_id = 0;
var pageReadyFunctions = [];
var KEYCODE_ENTER = 13;
var message_max_chars = parseInt($('.count').text());
var debug = false;

// Emit ready event.
io.emit('ready');

// Client Events
io.on('connect', function() {
  showDialog();
});
io.on('error', handleError);
io.on('login', login);
io.on('updatechat', updateChat);
io.on('updateusers', updateUser);

function handleError(message) {
  // console.log(message);
  var DISPLAY_TIME = 6000;
  // 6 Sec.
  var $target = $('#messages');
  var $errorContainer = $('.error-container');
  if ($('.modal').is(':visible')) {
    $target = $('.modal-body');
  }
  if (!$errorContainer.length) {
    $errorContainer = $('<div class="error-container" />');
  }
  $target.prepend($errorContainer);
  var $error = $('.alert', $errorContainer);
  if ($error.length) {
    window.clearTimeout(fehler_id);
    $error.html(message).show();
  } else {
    var $message = $('<div class="alert alert-danger">' + message + '</div>');
    $errorContainer.prepend($message);
  }
  $errorContainer.ready(function() {
    $('input:first', $errorContainer).focus();
    fehler_id = window.setTimeout(function() {
      $errorContainer.hide('slow').remove();
    }, DISPLAY_TIME);
  });
  showDialog();
}

function showDialog() {
  if (!$(window).data('user')) {
    $('#login').modal('show');
  }
}

function hideDialog() {
  $('#login').modal('hide');
}

function focusSendField() {
  $('#data').focus();
}

function login(username) {
  hideDialog();
  $(window).data('user', username);
}


function updateChat(data) {
  // console.log(data);   
  var username = data.username;
  var time = data.time;
  var message = data.message;
  if (!time) time = new Date();
  if (typeof username === 'undefined' || typeof message === 'undefined') {
    return false;
  }
  
  var messageDate = new Date();
  var day = messageDate.getDate();
  var month = messageDate.getMonth();
  var year = messageDate.getFullYear();
  var hours = messageDate.getHours();
  var minutes = messageDate.getMinutes();
  var seconds = messageDate.getSeconds();

  // var zeit = Date.create(time).format('{HH}:{mm}:{ss}');
  var titleDate = [zeroPrepend(day), '.', zeroPrepend(month), '.', year, ' - ', zeroPrepend(hours), ':', zeroPrepend(minutes), ':', zeroPrepend(seconds)].join('');
  var $time = '<span class="time" title="'+ titleDate +'">(' + zeroPrepend(hours) + ':' + zeroPrepend(minutes) + ') </span>';
  var $user = '<span class="username">' + username + ': </span>';
  var $message = '<span class="message">' + message + '</span>';
  var $entry = '<div class="entry">' + $time + $user + $message + '</div>';
  $('#messages-inner').append($entry);
  $('#messages-inner').animate({ 
    scrollTop: $('#messages-inner').height()
  }, 'slow');
  focusSendField();
  if (document[state] == "hidden") {      
    $.titleAlert("Neue Nachricht!");
  }
}

function zeroPrepend(number) {
  return (number < 10) ? '0' + number : number;
}

function updateUser(users) {
  // console.log(users);
  $('#users ul').empty();
  $.each(users, function(key, value) {
    var activeCSSClass = '';
    var user = '<a href="#">' + key + '</a>';
    if ($(window).data('user') == key) {
      activeCSSClass = ' active';
      user = key;
    }
    $('#users ul').append('<li class="list-group-item ' + activeCSSClass + '">' + user + '</li>');
  });
}

function insert(code) {
  $('#data').val($('#data').val() + " " + code + " ");
  $('.smiley-holder').popover('hide');
  focusSendField();
}

function clearChat() {
  $('#messages-inner').children().remove();
  focusSendField();
}

function initVisibilityStateListener() {
  if ( typeof document.hidden !== "undefined") {
    visibilityChange = "visibilitychange";
    state = "visibilityState";
  } else if ( typeof document.mozHidden !== "undefined") {
    visibilityChange = "mozvisibilitychange";
    state = "mozVisibilityState";
  } else if ( typeof document.msHidden !== "undefined") {
    visibilityChange = "msvisibilitychange";
    state = "msVisibilityState";
  } else if ( typeof document.webkitHidden !== "undefined") {
    visibilityChange = "webkitvisibilitychange";
    state = "webkitVisibilityState";
  }

  $(document).on(visibilityChange, function() {
    if (document[state] == 'visible') {
      document.title = $(document).data('title');
    }
  });
}

pageReadyFunctions.push(initVisibilityStateListener);

function initCountChars() {
  $('#data').on('keyup', function() {
    var akt_count = $(this).val().length;
    $('.count').html(message_max_chars - akt_count);
  });
}

pageReadyFunctions.push(initCountChars);

$(function() {

  if (debug) {
    var debugUsername = 'tester';
    $(window).data('user', debugUsername);
    io.emit('login', debugUsername);
  }

  for (var i in pageReadyFunctions) {
    pageReadyFunctions[i]();
  }

  $(document).data('title', document.title);

  $('#datasend').click(function() {
    var message = $('#data').val();
    if ($('#messages .input-append textarea:visible').length) {
      message = $('#messages .input-append textarea').val();
    }
    $('#data').val('');
    $('#messages .input-append textarea').val('');

    if (message === '/clear') {
      return clearChat();
    }
    io.emit('sendchat', message);
  });

  $('#data').keypress(function(e) {
    if (e.which == KEYCODE_ENTER) {
      $(this).blur();
      $('#datasend').click();
    }
  });

  $('#users #user-list').on('click', 'a', function(e) {
    $('#data').val('@' + $(this).text() + ' ' + $('#data').val()).focus();
    e.stopPropagation();
    return false;
  });


  $('#login .btn.btn-primary').click(function() {
    var username = $.trim($('#login input[name=nickname]').val());
    io.emit('login', username);
  });

  $('#login').on('shown.bs.modal', function() {
    $('#login input[name=nickname]').focus().select();
  });

  $('#login input[name=nickname]:first').on('keypress', function(e) {
    if (e.which == KEYCODE_ENTER) {
      $(this).blur();
      $('#login .btn.btn-primary').click();
      e.stopPropagation();
      return false;
    }
  });

  $('.navbar-toggle').on('click', function() {
    $('.sidebar').toggle();
    $('.navbar-toggle').toggleClass('active');
  });

  $(document).on('emojiClicked', function(event, data) {
    // $('.smiley-holder').popover('hide');
    // because popover hide don't work correct
    $('.smiley-holder').trigger('click');
    focusSendField();
  });
  
  
  $('.smiley-holder').popover({
    content : function() {
      return $('.emojioneselector').clone().emojiSelector({
        target: $('#data')
      });
    }
  });

});
