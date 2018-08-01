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
      case 'save_review':
        console.log('this.worker.onmessage', id, action, result);
        if (this.workerCallbacks[id]) {
          this.workerCallbacks[id](result);
        }
        break;
    }
  }

  this.workerCallbacks = {
    onReviewSave: [],
  };
}

TaskService.prototype = {

  saveReview(review, callback) {
    this.jobId = this.jobId + 1;
    // first step: save into indexedDB
    DBHelper.fetchRestaurantFromIndexedDb(review.restaurant_id).then(restaurant => {
      restaurant.reviews.push(review);
      DBHelper.putRestaurantIntoIndexedDb(restaurant);
    });

    // then send data to API
    this.worker.postMessage({
      id: this.jobId,
      action: 'save_review',
      payload: review
    });

    if (typeof callback === 'function') {
      this.workerCallbacks[this.jobId] = callback;
    }

  },

};

module.exports = TaskService;