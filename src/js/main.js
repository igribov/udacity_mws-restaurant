const DBHelper = require('./dbhelper');
const AccessibilitySelect = require('./accessibility-select');
const process = require('./process');
const { zip, zipReduce } = require('./helpers');

let restaurants,
  neighborhoods,
  cuisines;
var map;
var markers = [];
var scrolled = false;

const showHiddenRestaurants = () => {
  if (!scrolled) {
    scrolled = true;
  }
  const hiddenItems = document.querySelectorAll('#restaurants-list li.hidden');
  Array.prototype.forEach.call(hiddenItems, el => el.classList.remove('hidden'));
};
/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  process.registerServiceWorker();
  fetchNeighborhoodsAndCuisines().then((restaurants) => {
    fillRestaurantsHTML(restaurants);
  })
});

function toggleMap() {
  const map = document.getElementById('map');
  if (map.style.display === 'none'){
    this.setAttribute('aria-label', 'Close Google Map');
    map.style.display = 'block'
  } else {
    this.setAttribute('aria-label', 'Open Google Map');
    map.style.display = 'none'
  }
}

document.querySelector('#map-actions .toggle-map').onclick = toggleMap;

/**
 * Set neighborhoods HTML.
 */
function fillNeighborhoodsHTML(neighborhoods = self.neighborhoods) {
  const select = new AccessibilitySelect(
    '#neighborhoods-select',
    {
      name: 'Neighborhood',
      label: 'Neighborhood',
      initialValue: {name: 'All Neighborhoods', value: 'all'},
      values: self.neighborhoods,
      onChange: updateRestaurants
    }
  );
}


/**
 * Fetch all cuisines and set their HTML.
 */
function fetchNeighborhoodsAndCuisines() {
  return DBHelper.fetchNeighborhoodsAndCuisines().then(({ restaurants, neighborhoods, cuisines }) => {

    self.neighborhoods = neighborhoods;
    fillNeighborhoodsHTML(neighborhoods);

    self.cuisines = cuisines;
    fillCuisinesHTML(cuisines);

    return restaurants;

  }).catch(error => {
    console.error(error);
  });
}

/**
 * Set cuisines HTML.
 */
function fillCuisinesHTML(cuisines = self.cuisines) {

  const select = new AccessibilitySelect(
    '#cuisines-select',
    {
      name: 'Cuisines',
      label: 'Cuisines',
      initialValue: {name: 'All Cuisines', value: 'all'},
      values: cuisines,
      onChange: updateRestaurants
    }
  );
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });

  window.addEventListener('scroll', showHiddenRestaurants);

  setTimeout(function() {
    document.getElementById('map').querySelector('iframe').setAttribute('title', 'Google map');
  }, 200);
};

/**
 * Update page and map for current restaurants.
 */
function updateRestaurants() {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cuisine = cSelect.getAttribute('data-value');
  const neighborhood = nSelect.getAttribute('data-value');

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood).then(restaurants => {
    resetRestaurants(restaurants);
    fillRestaurantsHTML(restaurants);
  }).catch(error => {
    console.error(error);
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
function resetRestaurants(restaurants) {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if(self.markers) {
    self.markers.forEach(m => m.setMap(null));
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML(restaurants = self.restaurants) {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach((restaurant, i) => {
    ul.append(createRestaurantHTML(restaurant, i));
  });
  const addMarkers = () => addMarkersToMap(restaurants);
  setTimeout(addMarkers, 500);
}

function createImage(imgUrl, alt) {
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = imgUrl;
  image.setAttribute('alt', alt);
  return image;
}

function createResponsiveImage(imgUrl, alt, restaurant) {
  const imgUrls = [
    DBHelper.imageUrlForRestaurant(restaurant, 'small'),
    DBHelper.imageUrlForRestaurant(restaurant, 'medium'),
    DBHelper.imageUrlForRestaurant(restaurant, 'large'),
    DBHelper.imageUrlForRestaurant(restaurant, 'small'),
  ];

  const picture = document.createElement('picture');
  picture.className = 'restaurant-img';
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.setAttribute('src', imgUrl);
  image.setAttribute('alt', alt);
  let sources = zipReduce(
      imgUrls, 
      ['(max-width: 400px)', '(min-width: 701px) and (max-width: 1000px)', '(min-width: 500px) and (max-width: 700px)', '(mim-width: 1001px)'],
      (srcset, media, result) => {
        const source = document.createElement('source');
        source.setAttribute('media', media);
        source.setAttribute('srcset', srcset);
        return [ ...result, source];
      },
      []
  );
  sources.forEach(source => {
    picture.append(source);
  });
  picture.append(image);
  return picture;
}
/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant, index) {
  const li = document.createElement('li');
  li.setAttribute('tabindex', 0);
  if (index > 3) {
    li.className = 'hidden';
  }
  const picture = createResponsiveImage(
      DBHelper.imageUrlForRestaurant(restaurant),
      `An image from the restaurant ${restaurant.name}`,
      restaurant
  );
  li.append(picture);

  const infoBlock = document.createElement('div');
  infoBlock.className = 'restaurant-info';

  const name = document.createElement('h2');
  name.className = 'restaurant-card-name';
  name.setAttribute('tabindex', '0');
  name.innerHTML = restaurant.name;
  infoBlock.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.setAttribute('tabindex', 0);
  neighborhood.innerHTML = restaurant.neighborhood;
  infoBlock.append(neighborhood);

  const address = document.createElement('p');
  address.setAttribute('tabindex', 0);
  address.innerHTML = restaurant.address;
  infoBlock.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  infoBlock.append(more);
  li.append(infoBlock);

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
function addMarkersToMap(restaurants = self.restaurants) {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    if (!self.markers) {
      self.markers = [];
    }
    self.markers.push(marker);
  });
}
