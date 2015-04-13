import Ember from 'ember';
import layout from '../templates/components/auto-complete';

const observer = Ember.observer;
const computed = Ember.computed;
const map = computed.map;

/**
  @module AutoCompleteOption

  Provides a simple object proxy with some computed properties for use in the
  AutoComplete component. The AutoComplete component requires access to it's
  options in order to set its selection and filter out suggestions - Using
  another component here would be better semantically would require some fugly
  hacking to register the components together.

  Possibly consider using CollectionView?

  Notes:
    - Computed properties are underscored so that they will not conflict with
      potential objects being passed (`label` and `value` are fairly common
      property names, the others are underscored for consistency)
    - `_autoComplete` is a reference to the parent AutoComplete component. This
      would typically be done with `parentView` if this were a component.
      Aliasing could be used to clean up the code here, but some of the items
      are arguably sole properties of the AutoComplete component (`_selected`)
      whereas others have some right to be here (`optionLabelPath`,
      `optionValuePath`).
*/
const AutoCompleteOption = Ember.ObjectProxy.extend({
  /**
   * The resolved label of the option. If the option is an object then the label
   * is provided by the property at `optionLabelPath`. Otherwise the label is
   * the option itself. Must resolve to a string.
   *
   * @property _label
   * @private
   */
  _label: computed('content', '_autoComplete.optionLabelPath', function() {
    const content = this.get('content');
    const optionLabelPath = this.get('_autoComplete.optionLabelPath');

    if (optionLabelPath && content && typeof content === 'object') {
      return content.get(optionLabelPath);
    } else {
      return content;
    }
  }),

  /**
   * The resolved value of the option. If the option is an object then the value
   * is provided by the property at `optionLabelPath`. Otherwise the value is
   * the option itself.
   *
   * @property _label
   * @private
   */
  _value: computed('content', '_autoComplete.optionValuePath', function() {
    const content = this.get('content');
    const optionValuePath = this.get('_autoComplete.optionValuePath');

    if (optionValuePath && content && typeof content === 'object') {
      return content.get(optionValuePath);
    } else {
      return content;
    }
  }),

  /**
   * Label formatted to highlight the matched parts of the option.
   *
   * @property _label
   * @private
   */
  formattedLabel: computed('label', '_autoComplete.regexValue', function() {
    const label = this.get('_label');
    const highlightMatches = this.get('_autoComplete.highlightMatches');
    const regexValue = this.get('_autoComplete.regexValue');

    if (regexValue && highlightMatches) {
      return label.replace(regexValue, "<b>$&</b>");
    }

    return label;
  }),

  /**
   * Whether or not the option is selected.
   *
   * @property _label
   * @private
   */
  selected: computed('_label', '_autoComplete.value', function() {
    return this.get('_autoComplete.value') === this.get('_label');
  })
});

/**
  @module AutoComplete

  AutoComplete as a component is similar to a Select. The user types some input,
  suggestions appear in a dropdown list and can be clicked, and the value of the
  selected option is selected.
*/
export default Ember.Component.extend({
  layout: layout,

  classes: ['auto-complete'],

  /**
   * Two-way bound property representing the current value of the search input.
   *
   * @property value
   * @public
   */
  value: '',

  /**
   * Two-way bound property representing the current value of the selection.
   *
   * @property selection
   * @public
   */
  selection: null,

  /**
   * Two-way bound property representing the path to an option's value. This
   * value is what will be mapped to `selection` when an object is selected.
   *
   * @property optionValuePath
   * @public
   */
  optionValuePath: '',

  /**
   * Two-way bound property representing the path to an option's label. This
   * value is what will be mapped to `value` when an option is selected.
   *
   * @property optionLabelPath
   * @public
   */
  optionLabelPath: '',

  /**
   * Determines whether or not the content of this AutoComplete is provided
   * asynchronously. If it is, it is assumed that the user is filtering the list
   * on their own and no filtering is done by the component.
   *
   * @property async
   * @private
   */
  async: false,

  /**
   * Determines whether or not the matching segment of option labels will be
   * highlighted.
   *
   * @property highlightMatches
   * @public
   */
  highlightMatches: true,

  /**
   * Determines whether or not the matching segment of option labels will be
   * highlighted.
   *
   * @property highlightMatches
   * @public
   */
  isOpen: false,

  /**
   * Internal representation of the option list for the AutoComplete. Wraps
   * each option in an AutoCompleteOption proxf object which has various
   * computed properties for determining an objects value, label, etc.
   *
   * @property options
   * @private
   */
  options: map('content', function(option) {
    // Wrap standard JS objects in Ember objects
    if (Ember.typeOf(option) === 'object' ) {
      option = Ember.Object.create(option);
    }

    return AutoCompleteOption.create({
      _autoComplete: this,
      content: option
    });
  }),

  /**
   * A regular expression of the current value of the input, used in a few
   * locations (null if no value is blank)
   *
   * @property regexValue
   * @private
   */
  regexValue: computed('value', function() {
    const value = this.get('value');

    if (value) {
      return new RegExp(value, 'g');
    }
  }),

  /**
   * The filtered list of options. Filtered by regex comparison of value to
   * label if non-async, otherwise not filtered.
   *
   * @property filteredOptions
   * @private
   */
  filteredOptions: computed('options.@each', 'regexValue', function() {
    if (this.get('async')) { return this.get('options'); }

    const regexValue = this.get('regexValue');

    return Ember.A(this.get('options').filter(function(option) {
        return option.get('_label').match(regexValue);
      })
    );
  }),

  focusIn() {
    this.open();
  },

  focusOut() {
    this.close();
  },

  /**
   * Sets the selection property when one of the options is selected. This can
   * happen either when the user clicks on an option, or when they type the full
   * label into the input.
   *
   * @property setSelection
   * @private
   */
  setSelection: observer('options.@each.selected', function() {
    const selection = this.get('options').findBy('selected');

    if (selection) {
      this.set('selection', selection.get('_value'));
    } else {
      this.set('selection', null);
    }
  }),

  closedKeydownMap: {
    13/*enter*/: 'open',
    40/*down*/:  'open',
  },

  openKeydownMap: {
    27/*esc*/:   'closeAndFocus',
    32/*space*/: 'selectFocusedOption',
    13/*enter*/: 'selectFocusedOption',
    40/*down*/:  'focusNext',
    38/*up*/:    'focusPrevious',
    8/*backspace*/: 'startBackspacing'
  },

  /**
   * Handles keyboard interactions from all elements in the component.
   *
   * @method handleKeydown
   * @private
   */

  keyDown(event) {
    const map = this.get('isOpen') ? this.get('openKeydownMap') : this.get('closedKeydownMap');
    const method = map[event.keyCode];

    if (this[method]) {
      return this[method](event);
    }

    const input = this.$('input')[0];
    // After this we focus the input, but if they are using shift, we don't
    // want to actually do it (they are probably shift+tabbing away). This is a
    // blacklist of one, which makes me really nervous. We want to allow any
    // valid input character, but that's a huge whitelist, or maybe use the
    // run loop and wait for focus to settle on the new element and then decide
    // what to do.
    if (event.shiftKey) {
      return;
    }
    if (document.activeElement !== input) {
      input.focus();
      // if its not backspace, then we want to select the input, since its
      // keyDown, then on keyUp the contents will be replaced, but with
      // backspace, we dont' want to do that.
      if (event.keyCode !== 8/*backspace*/) {
        input.select();
      }
    }
  },

  focusNext(event) {
    event.preventDefault();

    const input = this.$('input');
    const focusedOption = this.$('.auto-complete__option:focus').first();
    const firstOption = this.$('.auto-complete__option:first').first();
    const lastOption = this.$('.auto-complete__option:last').first();

    if (focusedOption[0] === lastOption[0]) {
      input[0].focus();
    } else if (focusedOption.length) {
      focusedOption.next()[0].focus();
    } else {
      firstOption.focus();
    }
  },

  /**
   * Focuses the previous option in the popover.
   *
   * @method focusPrevious
   * @private
   */

  focusPrevious(event) {
    event.preventDefault();

    const input = this.$('input');
    const focusedOption = this.$('.auto-complete__option:focus').first();
    const firstOption = this.$('.auto-complete__option:first').first();
    const lastOption = this.$('.auto-complete__option:last').first();

    if (focusedOption[0] === firstOption[0]) {
      input.focus();
    } else if (focusedOption.length) {
      focusedOption.prev().focus();
    } else {
      lastOption.focus();
    }
  },

  /**
   * Focuses an option given an index in the options cache.
   *
   * @method focusOptionAtIndex
   * @private
   */

  selectFocusedOption() {
    this.$('.auto-complete__option:focus').click();
  },

  /**
   * Sets the option as the `focusedOption`
   *
   * @method focusOption
   * @private
   */

  open() {
    this.set('isOpen', true);
  },

  close() {
    this.set('isOpen', false);
  },

  closeAndFocus() {
    this.$('input').focus();
    this.close();
  },

  click(event) {
    if (this.$(event.target).is('input')) {
      this.open();
    }
  },

  actions: {
    /**
     * Selects a clicked option, sets the component's value and selection to the
     * option's label and value, respectively.
     *
     * @property selectOption
     * @private
     */
    selectOption: function(option) {
      const selection = option.get('_value');
      const value = option.get('_label');

      this.set('value', value);

      this.closeAndFocus();

      if (this.get('onSelect')) {
        this.sendAction('onSelect', this, selection);
      }
    }
  }
});
