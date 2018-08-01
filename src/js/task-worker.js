
const port = 1337; // Change this to your server port
const DATABASE_URL = `http://localhost:${port}`;

onmessage = function({ data: { action, payload }}) {
  console.log('Message received from main script', action, payload);

  switch (action) {

    case 'save_review':
      let timerId = setInterval(function() {
        saveReview(payload)
          .then((result) => {
            clearInterval(timerId);
            postMessage({ action, result });
          })
          .catch(err => {
            console.log('[worker::] try to save review.');
          })
      }, 1000);
      break;
  }

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