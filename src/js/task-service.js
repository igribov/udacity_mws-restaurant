const DBHelper = require('./dbhelper');

function TaskService() {
  this.worker = new Worker('task-worker.js');
  this.jobId = 0;
  this.worker.onmessage = ({ data: { id = 0, action, result } }) => {
    switch (action) {
      case 'offline':
      case 'online':
        const statusEvent = new CustomEvent('serverstatus', { detail: { online: action === 'online' } });
        document.dispatchEvent(statusEvent);
        break;
      default:
        if (this.workerCallbacks[id]) {
          this.workerCallbacks[id](result);
          delete this.workerCallbacks[id];
        }
    }
  }

  this.workerCallbacks = {
    onReviewSave: [],
  };

}

TaskService.prototype = {

  beforeTaskAdd() {
    this.jobId = this.jobId + 1;
  },

  addCallback(callback) {
    if (typeof callback === 'function') {
      this.workerCallbacks[this.jobId] = callback;
    }
  },

  saveReview(review, callback) {
    this.beforeTaskAdd();

    // then send data to API
    this.worker.postMessage({
      id: this.jobId,
      action: 'save_review',
      payload: review
    });

    this.addCallback(callback);
  },

  toggleFavorite(restaurant, callback) {
    this.beforeTaskAdd();

    // then send data to API
    this.worker.postMessage({
      id: this.jobId,
      action: 'set_favorite',
      payload: {
        id: this.jobId,
        restaurantId: restaurant.id,
        isFavorite: !JSON.parse(self.restaurant.is_favorite),
      }
    });

    this.addCallback(callback);
  },

};

module.exports = TaskService;