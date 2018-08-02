'use strict';

var port = 1337; // Change this to your server port
var DATABASE_URL = 'http://localhost:' + port;

onmessage = function onmessage(_ref) {
  var _ref$data = _ref.data,
      id = _ref$data.id,
      action = _ref$data.action,
      payload = _ref$data.payload;

  var offlineMessageSend = false;
  var timerId = void 0;
  var runMethod = void 0;

  switch (action) {

    case 'save_review':
      runMethod = saveReview;
      break;

    case 'set_favorite':
      runMethod = setFavorite;
      break;
  }

  if (!runMethod) {
    return;
  }

  timerId = setInterval(function () {
    runMethod(payload).then(function (result) {
      clearInterval(timerId);
      if (offlineMessageSend) {
        postMessage({ action: 'online' });
      }
      postMessage({ id: id, action: action, result: result });
    }).catch(function (err) {
      console.log('[worker::] process loop');
      if (!offlineMessageSend) {
        offlineMessageSend = true;
        postMessage({ action: 'offline' });
      }
    });
  }, 1000);
};

function saveReview(review) {
  return fetch(DATABASE_URL + '/reviews/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(review)
  }).then(function (data) {
    return data.json();
  });
}

function setFavorite(_ref2) {
  var restaurantId = _ref2.restaurantId,
      _ref2$isFavorite = _ref2.isFavorite,
      isFavorite = _ref2$isFavorite === undefined ? true : _ref2$isFavorite;

  return fetch(DATABASE_URL + '/restaurants/' + restaurantId + '/?is_favorite=' + isFavorite, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(function (data) {
    return data.json();
  });
}