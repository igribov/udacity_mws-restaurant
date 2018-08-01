const DBHelper = require('./dbhelper');

function TaskService() {
  this.worker = new Worker('task-worker.js');

  this.worker.onmessage = function ({ data: { action, result } }) {
    console.log('this.worker.onmessage', action, result);

    switch (action) {
      case 'save_review':

        break;
    }
  }
}

TaskService.prototype = {

  saveReview(review) {

    // first step: save into indexedDB
    DBHelper.fetchRestaurantFromIndexedDb(review.restaurant_id).then(restaurant => {
      restaurant.reviews.push(review);
      DBHelper.putRestaurantIntoIndexedDb(restaurant);
    });

    // then send data to API
    this.worker.postMessage({
      action: 'save_review',
      payload: review
    });
  },

};

module.exports = TaskService;