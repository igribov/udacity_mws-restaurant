let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  //registerServiceWorker();
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
function fetchRestaurantFromURL(callback) {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
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
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews = self.restaurant.reviews) {

  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHTML(review) {

  const li = document.createElement('li');
  li.setAttribute('tabindex', '0');
  li.className = 'reviews-list-item';

  const reviewerInfoBlock = document.createElement('div');
  reviewerInfoBlock.className = 'reviewer-info';

  const reviewerNameDate = document.createElement('div');
  reviewerNameDate.className = 'reviewer-info__name-date';

  const name = document.createElement('h3');
  name.innerHTML = review.name;

  const date = document.createElement('date');
  date.innerHTML = review.date;

  reviewerNameDate.appendChild(name);
  reviewerNameDate.appendChild(date);

  reviewerInfoBlock.appendChild(reviewerNameDate);

  reviewerInfoBlock.appendChild(createRatingStarsBlock(review.rating));

  li.appendChild(reviewerInfoBlock);

  const comments = document.createElement('p');
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
