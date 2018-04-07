
function AccessibilitySelect(selector, options = {}) {
  this.select = document.querySelector(selector);
  this.select.setAttribute('aria-label', options.label);
  this.select.setAttribute('tabindex', '0');
  this.select.setAttribute('role', 'listbox');

  if (!this.select) {
    return;
  }

  this.onChange = options.onChange || (() => {});

  const dropdown = document.createElement('span');
  dropdown.className = 'custom-select__dropdown';

  this.selectedValueBlock = document.createElement('span');
  this.selectedValueBlock.className = 'custom-select__selected-item-value';
  this.selectedValueBlock.setAttribute('data-value', options.initialValue.value);
  this.selectedValueBlock.innerText = options.initialValue.name || '';
  dropdown.append(this.selectedValueBlock);

  const dropdownButton = document.createElement('span');
  dropdownButton.className = 'custom-select__dropdown-button';
  dropdownButton.setAttribute('role', 'button');
  dropdownButton.setAttribute('aria-label', 'open dropdown list');

  dropdown.append(dropdownButton);
  this.select.append(dropdown);

  this.itemsList = document.createElement('ul');
  this.itemsList.className = 'custom-select__list';

  const neighborhoods = options.values || [];

  const option = document.createElement('li');
  option.setAttribute('tabindex', '0');
  option.setAttribute('role', 'option');
  option.setAttribute('id', options.name + '_elem');
  option.innerHTML = options.initialValue.name;
  option.setAttribute('data-value', options.initialValue.value);
  option.addEventListener('click', (e) => {
    console.log(1);
    this.onListElementClick.bind(this)(e);
  });
  this.itemsList.append(option);
  this.setSelectedElement(option);

  neighborhoods.forEach((neighborhood, index) => {
    const option = document.createElement('li');
    option.setAttribute('tabindex', '0');
    option.setAttribute('role', 'option');
    option.setAttribute('id', options.name + '_elem_' + index);
    option.innerHTML = neighborhood;
    option.setAttribute('data-value', neighborhood);
    option.addEventListener('click', this.onListElementClick.bind(this));
    this.itemsList.append(option);
  });

  this.select.append(this.itemsList);

  this.activeItemIdx = 0;

  dropdownButton.addEventListener('click', this.toggleDropDown.bind(this));
  this.selectedValueBlock.addEventListener('click', this.toggleDropDown.bind(this));

  this.select.addEventListener('keydown', this.handleKeyDown.bind(this));
}

AccessibilitySelect.prototype = {

  toggleDropDown() {
    if (this.itemsList.classList.contains('open')) {
      this.itemsList.classList.remove('open');
    } else {
      this.itemsList.classList.add('open');
    }
  },

  openDropDown() {
    this.itemsList.classList.add('open');
  },

  closeDropDown() {
    this.itemsList.classList.remove('open');
  },

  onListElementClick(e) {
    const selectedElementIndex = Array.prototype.indexOf.call(this.itemsList.children, e.target);
    if (!selectedElementIndex === -1)
      return;

    this.activeItemIdx = selectedElementIndex;
    this.setSelectedElement(this.itemsList.children[this.activeItemIdx]);
    this.closeDropDown();
  },

  setSelectedElement(element) {
    if (!element)
      return;

    const value = element.getAttribute('data-value');
    this.selectedValueBlock.setAttribute('data-value', value);
    this.select.setAttribute('data-value', value);
    this.selectedValueBlock.innerText = element.innerText;
    for (const el of this.itemsList.children) {
      el.setAttribute('aria-selected', '');
    }
    element.setAttribute('aria-selected', 'true');
    this.select.setAttribute('aria-activedescendant', element.id);
    this.onChange();
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
        this.openDropDown();
        this.itemsList.children[this.activeItemIdx].focus();
        break;
      case VK_ENTER:
        const active = this.itemsList.children[this.activeItemIdx];
        if (!active)
          break;
        this.setSelectedElement(active);
        this.closeDropDown();
        this.select.focus();
        break;
      case VK_ESC:
        this.closeDropDown();
        this.select.focus();
        break;
    }

    return;
  },
  nextActiveListItem() {
    const nextElementIndex = (this.activeItemIdx >= this.itemsList.children.length - 1) ? 0 : (this.activeItemIdx + 1);
    this.itemsList.children[nextElementIndex].focus();
    this.activeItemIdx = nextElementIndex;

  },
  previousActiveListItem() {
    const prevElementIndex = (this.activeItemIdx === 0) ? this.itemsList.children.length - 1 : (this.activeItemIdx - 1);
    this.itemsList.children[prevElementIndex].focus();
    this.activeItemIdx = prevElementIndex;
  }
};