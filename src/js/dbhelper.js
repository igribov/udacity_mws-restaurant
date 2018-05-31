const idb  = require('idb');
const APP_DB_NAME = 'restaurants-db';
const DB_RESTAURANTS_TABLE = 'restaurants';
const APP_DB_VER = 1;

/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {
    return fetch(DBHelper.DATABASE_URL + '/restaurants')
      .then(data => data.json())
      .then(restaurants => {
        return this.putRestaurantsIntoIndexedDb(restaurants).then(() => restaurants);
      })
      .catch(err => {
        return DBHelper.fetchRestaurantsFromIndexedDb().then(restaurants => {
          if (!restaurants.length) {
            throw new Error('Fetch error');
          } else {
            return restaurants;
          }
        })
      })
  }

  /**
   * Fetch all restaurant.
   */
  static fetchRestaurant(id) {
    return fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}`)
      .then(data => data.json())
      .then(restaurant => {
        return this.putRestaurantIntoIndexedDb(restaurant).then(() => restaurant);
      })
      .catch(err => {
        return DBHelper.fetchRestaurantFromIndexedDb(id).then(restaurant => {
          if (!restaurant) {
            throw new Error('Fetch error');
          } else {
            return restaurant;
          }
        })
      })
  }

  static fetchRestaurantsFromIndexedDb() {
    return DBHelper.openDatabase()
      .then(db => db.transaction(DB_RESTAURANTS_TABLE).objectStore(DB_RESTAURANTS_TABLE).getAll());
  }

  static fetchRestaurantFromIndexedDb(id) {
    return DBHelper.openDatabase().then(db =>
      db.transaction(DB_RESTAURANTS_TABLE).objectStore(DB_RESTAURANTS_TABLE).get(+id));
  }

  static putRestaurantsIntoIndexedDb(restaurants) {
    return DBHelper.clearRestaurantsInIndexedDb().then(() => DBHelper.openDatabase().then(db => {
        const tx = db.transaction(DB_RESTAURANTS_TABLE, 'readwrite');
        restaurants.forEach(restaurant => tx.objectStore(DB_RESTAURANTS_TABLE).put(restaurant));
        return tx.complete;
      })
    );
  }

  static putRestaurantIntoIndexedDb(restaurant) {
    return DBHelper.openDatabase().then(db => {
      const tx = db.transaction(DB_RESTAURANTS_TABLE, 'readwrite');
      tx.objectStore(DB_RESTAURANTS_TABLE).put(restaurant);
      return tx.complete;
    });
  }

  static clearRestaurantsInIndexedDb() {
    return DBHelper.openDatabase().then(db => {
      const tx = db.transaction(DB_RESTAURANTS_TABLE, 'readwrite');
      tx.objectStore(DB_RESTAURANTS_TABLE).clear();
      return tx.complete;
    });
  }

  static openDatabase() {
    return idb.open(APP_DB_NAME, APP_DB_VER, (upgradeDb) => {
      switch (upgradeDb.oldVersion) {
        case 0 :
          const restaurantStore = upgradeDb.createObjectStore(DB_RESTAURANTS_TABLE, {keyPath: 'id'});
          restaurantStore.createIndex('status', 'status');
        // break omitted
        default :
      }
    });
  }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id) {
    // fetch all restaurants with proper error handling.
    return DBHelper.fetchRestaurant(id).then(restaurant => {
      return restaurant
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants().then(restaurants => {
      return restaurants.filter(r => r.cuisine_type == cuisine);
    });

  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood) {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants().then(restaurants => {
      return restaurants.filter(r => r.neighborhood == neighborhood);
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood) {

    return DBHelper.fetchRestaurants().then(restaurants => {
      let results = restaurants;

      if (cuisine != 'all') { // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood != 'all') { // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }
      return results;
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods() {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants().then(restaurants => {
      const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
      // Remove duplicates from neighborhoods
      return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines() {
    // Fetch all restaurants
    return DBHelper.fetchRestaurants().then(restaurants => {
      // Get all cuisines from all restaurants
      const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
      // Remove duplicates from cuisines
      return cuisines.filter((v, i) => cuisines.indexOf(v) == i)
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/${restaurant.id}_small.jpg`;
  }

  /**
   * Restaurant image URL.
   */
  static imageSrcSetForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}

module.exports = DBHelper;