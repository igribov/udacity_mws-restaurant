const DBHelper = require('./dbhelper');
const TaskService = require('./task-service');
const process = require('./process');
const RatingSelect = require('./rating-select');

let restaurant;
var map;
const taskService = new TaskService();
const statusBar = document.getElementById('server-status-bar');

process.registerServiceWorker();

document.addEventListener('serverstatus', function (e) {
  statusBar.classList.toggle('-online', e.detail.online);
}, false);

ratingForm();

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  setTimeout(() => {
    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: self.restaurant.latlng,
      scrollwheel: false
    });
  }, 200);
};

fetchRestaurantFromURL().then(restaurant => {
  self.restaurant = restaurant;

  fillRestaurantHTML();

  fillBreadcrumb();
  DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);

}).catch(err => {
  console.error(err);
});


/**
 * Get current restaurant from page URL.
 */
function fetchRestaurantFromURL(force = false) {
  if (!force && self.restaurant) { // restaurant already fetched!
    return self.restaurant;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    throw new Error('No restaurant id in URL');
  } else {
    return DBHelper.fetchRestaurantById(id).then((restaurant) => {

      if (!restaurant) {
        throw new Error('No restaurant');
      }

      return restaurant;
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(restaurant = self.restaurant) {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.setAttribute('tabindex', '0');

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.setAttribute('alt', `An image from the restaurant ${restaurant.name}`);
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.setAttribute('tabindex', '0');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
function fillRestaurantHoursHTML(operatingHours = self.restaurant.operating_hours) {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.setAttribute('aria-label', operatingHours[key] + ','); // for screen reader
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews = self.restaurant.reviews) {

  const container = document.getElementById('reviews-container');
  const ul = document.getElementById('reviews-list');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
}

function clearReviewsHtml() {
  Array.prototype.forEach.call(
    document.querySelectorAll('.reviews-list-item'),
    li => li.remove()
  );
}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHTML(review) {

  const li = document.createElement('li');
  li.setAttribute('tabindex', '0');
  li.className = 'reviews-list-item';
  li.setAttribute('aria-label', 'review');

  const reviewerInfoBlock = document.createElement('div');
  reviewerInfoBlock.className = 'reviewer-info';

  const reviewerNameDate = document.createElement('div');
  reviewerNameDate.className = 'reviewer-info__name-date';

  const name = document.createElement('h3');
  name.setAttribute('tabindex', '0');
  name.setAttribute('aria-label', review.name);
  name.innerHTML = review.name;

  const date = document.createElement('date');
  date.setAttribute('tabindex', '0');
  date.innerHTML = new Date(review.updatedAt).toDateString();

  reviewerNameDate.appendChild(name);
  reviewerNameDate.appendChild(date);

  reviewerInfoBlock.appendChild(reviewerNameDate);

  reviewerInfoBlock.appendChild(createRatingStarsBlock(review.rating));

  li.appendChild(reviewerInfoBlock);

  const comments = document.createElement('p');
  comments.setAttribute('tabindex', '0');
  comments.className = 'reviewer-comment';
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

function createRatingStarsBlock(ratingValue) {
  const rating = document.createElement('p');

  rating.appendChild((() => {
    let span = document.createElement('span');
    span.className = 'rating-number';
    span.setAttribute('tabindex', '0');
    span.innerHTML = 'Rating : ' + ratingValue;
    return span;
  })());

  let ratingStars = '★'.repeat(+ratingValue);

  if (+ratingValue < 5) {
    ratingStars = ratingStars + '☆'.repeat(5 - +ratingValue);
  }
  const ratingStarsElement = document.createElement('span');
  ratingStarsElement.className = 'rating-stars';
  ratingStarsElement.innerHTML = ratingStars;
  rating.appendChild(ratingStarsElement);

  return rating;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
function fillBreadcrumb(restaurant=self.restaurant) {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

function createRatingSelect() {

}

function ratingForm() {
  const form = document.getElementById('send-rating-form');
  if (!form) {
    return;
  }

  const select = new RatingSelect('#rating-select', {
    label: 'Rating',
    max: 5,
  });

  form.onsubmit = function(e) {
    e.preventDefault();
    const {
      name: { value : name },
      rating: { value : rating },
      comments: { value : comments }
    } = e.target.elements;

    Array.prototype.map.call(
      document.querySelectorAll('#send-rating-form .form-group'),
      el => el.classList.remove('has-error')
    );

    let valid = true;

    if (!name.trim()) {
      const field = document.querySelector('[data-field="name"]');
      field.parentElement.classList.add('has-error');
      field.innerHTML = 'Enter your name';
      valid = false;
    }
    if (rating <= 0) {
      const field = document.querySelector('[data-field="rating"]');
      field.parentElement.classList.add('has-error');
      field.innerHTML = 'Set rating';
      valid = false;
    }
    if (!comments.trim()) {
      const field = document.querySelector('[data-field="comments"]');
      field.parentElement.classList.add('has-error');
      field.innerHTML = 'Enter comment';
      valid = false;
    }

    if (!valid) {
      return;
    }

    const curDate = (new Date()).getTime();

    const review = {
      restaurant_id: self.restaurant.id,
      name,
      rating,
      comments,
      createdAt: curDate,
      updatedAt: curDate,
    };

    addReviewComment(review);
    form.reset();
    select.reset();
  }
}

function addReviewComment(review) {
  const ul = document.getElementById('reviews-list');
  const li = createReviewHTML(review);
  li.classList.add('-added');
  ul.appendChild(li);
  taskService.saveReview(review, () => {
    fetchRestaurantFromURL(true).then(restaurant => {
      self.restaurant = restaurant;
      clearReviewsHtml();
      fillReviewsHTML();
    });
  });
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName (name, url) {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) {
    return null;
  }

  if (!results[2]) {
    return '';
  }

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
