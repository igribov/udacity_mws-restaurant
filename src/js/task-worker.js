
const port = 1337; // Change this to your server port
const DATABASE_URL = `http://localhost:${port}`;

onmessage = function({ data: { id, action, payload }}) {
  let offlineMessageSend = false;
  let timerId;
  let runMethod;

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

  timerId = setInterval(function() {
    runMethod(payload)
      .then((result) => {
        clearInterval(timerId);
        if (offlineMessageSend) {
          postMessage({ action: 'online' });
        }
        postMessage({ id, action, result });
      })
      .catch(err => {
        console.log('[worker::] process loop');
        if(! offlineMessageSend) {
          offlineMessageSend = true;
          postMessage({ action: 'offline' });
        }
      })
  }, 1000);

};

function saveReview(review) {
 return fetch(`${DATABASE_URL}/reviews/`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(review),
    }
  ).then(data => data.json())
}

function setFavorite({ restaurantId, isFavorite }) {

  return fetch(`${DATABASE_URL}/restaurants/${restaurantId}/?is_favorite=${isFavorite}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    }
  ).then(data => data.json())
}