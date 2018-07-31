
function RatingSelect(selector, options = {}) {

  this.rating = document.querySelector(selector);
  this.starList = [];

  if (!this.rating) {
    return;
  }

  this.rating.setAttribute('aria-label', options.label);
  this.rating.setAttribute('tabindex', '0');
  this.rating.setAttribute('role', 'radiogroup');
  this.rating.className = 'rating-select';

  for (let i = 1; i <= options.max; i++) {
    const star = document.createElement('div');
    star.className = 'rating-select__item';
    star.setAttribute('role', 'radio');
    star.setAttribute('aria-checked', false);
    star.setAttribute('tabindex', 0);
    this.starList.push(star);
    star.addEventListener('click', e => {
      const clickedStarIndex = this.starList.indexOf(e.target);
      this.starList.map((el, i) => {
        el.classList.toggle('rating-select__item--checked', i <= clickedStarIndex);
        if (i === clickedStarIndex) {
          el.setAttribute('aria-checked', true);
          star.setAttribute('tabindex', 0);
        } else {
          el.setAttribute('aria-checked', false);
          star.setAttribute('tabindex', -1);
        }
      });
    });
    this.rating.append(star);
  }


  /*
  <div role="radiogroup"
     aria-labelledby="gdesc1"
    >
  <h3>
    Pizza Crust
  </h3>
  <div role="radio"
       aria-checked="false"
       tabindex="0">
     Regular crust
  </div>
  <div role="radio"
       aria-checked="false"
       tabindex="-1">
     Deep dish
  </div>
  <div role="radio"
       aria-checked="false"
       tabindex="-1">
     Thin crust
  </div>
</div>
<span class="rating-stars">☆</span>
          <span class="rating-stars">★</span>
  */


}

module.exports = RatingSelect;