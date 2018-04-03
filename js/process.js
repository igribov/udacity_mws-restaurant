/* Register service worker with events */
function registerServiceWorker() {
  if (!'serviceWorker' in navigator) {
    throw new Error('serviceWorker not register');
  }

  navigator.serviceWorker.register('/sw.js').then(function (reg) {
    if (!navigator.serviceWorker.controller) {
      return;
    }
    if (reg.active) {
      console.log('There is an an active service worker');
    }

    if (reg.waiting) {
      console.log('waiting :', reg.waiting);
      console.log('service worker is waiting');
      updateServiceWorker(reg.waiting);
    }

    if (reg.installing) {
      console.log('installing : ', reg);
      console.log('service worker status is installing');
      trackInstalling(reg.installing);
    }

    reg.addEventListener('updatefound', function () {
      console.log('service worker update found', reg);
      trackInstalling(reg.installing);
    });

    var refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (refreshing) return;
      setTimeout(function () {
        window.location.reload();
        refreshing = true;
      }, 1000);
    });

  }).catch(function (error) {
    console.log('Registration failed with ' + error);
  });
}

function trackInstalling(installingWorker) {
  if (!installingWorker) {
    console.log('Worker not defined!');
    return;
  }
  installingWorker.addEventListener('statechange', function () {
    console.log('ServiceWorker state was changed to ' + installingWorker.state);
    if (installingWorker.state === 'installed') {
      console.log('Service worker installed and waiting for activation', installingWorker);
      updateServiceWorker(installingWorker);
    }
  });
}

function updateServiceWorker(worker) {
  sendMessageToServiceWorker({action: 'skipWaiting'}, worker)
    .then(function (responseFromSw) {
      console.log(responseFromSw);
    });
}

function sendMessageToServiceWorker(msg, worker) {
  return new Promise(function (resolve, reject) {
    var msgChan = new MessageChannel();

    // Handler for recieving message reply from service worker
    msgChan.port1.onmessage = function (event) {
      if (event.data.error) {
        reject(event.data.error);
      } else {
        resolve(event.data);
      }
    };
    // Send message to service worker along with port for reply
    worker.postMessage(msg, [msgChan.port2]);
  });
}