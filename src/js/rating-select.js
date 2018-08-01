function RatingSelect(selector, options) {
  options = options || {};
  options.max = options.max || 5;

  this.rating = document.querySelector(selector);

  this.starList = [];

  if (!this.rating) {
    return;
  }

  this.rating.setAttribute('aria-label', options.label);
  this.rating.setAttribute('tabindex', '0');
  this.rating.setAttribute('role', 'radiogroup');
  this.rating.setAttribute('aria-valuenow', 0);
  this.rating.setAttribute('aria-valuemin', 0);
  this.rating.setAttribute('aria-valuemax', options.max);
  this.rating.className = 'rating-select';

  for (let i = 1; i <= options.max; i++) {
    const star = document.createElement('div');
    star.className = 'rating-select__item';
    star.setAttribute('role', 'radio');
    star.setAttribute('aria-checked', false);
    star.setAttribute('tabindex', 0);
    star.setAttribute('data-value', i);
    this.starList.push(star);
    star.addEventListener('click', this.onRatingElementClick.bind(this));
    this.rating.append(star);
  }

  this.rating.addEventListener('keydown', this.handleKeyDown.bind(this));
  this.activeItemIdx = 0;

  this.ratingInput = document.createElement('input');
  this.ratingInput.setAttribute('value', 0);
  this.ratingInput.setAttribute('name', options.inputName || 'rating');
  this.ratingInput.setAttribute('id', options.inputName || 'rating');
  this.ratingInput.setAttribute('type', 'hidden');
  this.rating.append(this.ratingInput);
}

RatingSelect.prototype = {

  reset() {
    console.log('reset');
    this.rating.setAttribute('aria-valuenow', 0);
    this.ratingInput.setAttribute('value', 0);
    this.activeItemIdx = 0;
    this.starList.forEach(el => {
      el.classList.remove('rating-select__item--checked');
      el.setAttribute('aria-checked', false);
      el.setAttribute('tabindex', -1);
    });
    this.starList[0].setAttribute('tabindex', 0);
  },

  onRatingElementClick(e) {
    const clickedStarIndex = this.starList.indexOf(e.target);

    if (!clickedStarIndex === -1) return;
    this.activeItemIdx = clickedStarIndex;

    this.starList.map((el, i) => {
      el.classList.toggle('rating-select__item--checked', i <= clickedStarIndex);
      if (i === clickedStarIndex) {
        el.setAttribute('aria-checked', true);
        el.setAttribute('tabindex', 0);
      } else {
        el.setAttribute('aria-checked', false);
        el.setAttribute('tabindex', -1);
      }
    });
    const val = e.target.getAttribute('data-value');
    this.rating.setAttribute('data-value', val);
    this.rating.setAttribute('aria-valuenow', val);
    this.ratingInput.setAttribute('value', val);

  },

  handleKeyDown(e) {
    // Define values for keycodes
    const VK_ENTER = 13;
    const VK_ESC = 27;
    const VK_SPACE = 32;
    const VK_LEFT = 37;
    const VK_UP = 38;
    const VK_RIGHT = 39;
    const VK_DOWN = 40;

    if ([VK_DOWN, VK_UP, VK_SPACE, VK_ENTER, VK_LEFT, VK_RIGHT, VK_ESC].indexOf(e.keyCode) === -1) {
      return;
    }
    e.preventDefault();
    switch (e.keyCode) {
      case VK_DOWN:
      case VK_RIGHT:
        this.nextActiveListItem();
        break;
      case VK_UP:
      case VK_LEFT:
        this.previousActiveListItem();
        break;
      case VK_SPACE:
        this.onRatingElementClick(e);
        this.rating.focus();
        break;
      case VK_ENTER:
        this.onRatingElementClick(e);
        this.rating.focus();
        break;
      case VK_ESC:
        this.rating.focus();
        break;
    }

    return;
  },

  nextActiveListItem() {
    const nextElementIndex = (this.activeItemIdx >= this.starList.length - 1) ? 0 : (this.activeItemIdx + 1);
    this.starList[nextElementIndex].focus();
    this.activeItemIdx = nextElementIndex;
  },

  previousActiveListItem() {
    const prevElementIndex = (this.activeItemIdx === 0) ? this.starList.length - 1 : (this.activeItemIdx - 1);
    this.starList[prevElementIndex].focus();
    this.activeItemIdx = prevElementIndex;
  },

}

module.exports = RatingSelect;