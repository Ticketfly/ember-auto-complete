import Ember from 'ember';
import layout from '../templates/components/auto-complete-list';

const alias = Ember.computed.alias;

export default Ember.Component.extend({
  layout: layout,

  template: alias('parentView.template'),

  tagName: 'ul',

  attributeBindings: [
    'role',
    'aria-expanded'
  ],

  classNames: [
    'auto-complete__options'
  ],

  classNameBindings: [
    'isOpen::hide'
  ],

  selectOption: 'selectOption',

  filteredOptions: alias('parentView.filteredOptions'),

  isOpen: alias('parentView.isOpen'),

  /**
   * Tells the screenreader how to deal with this element.
   * http://www.w3.org/TR/wai-aria/roles#listbox
   *
   * @property role
   * @private
   */

  role: 'listbox',

  didInsertElement() {
    this.get('parentView').set('list',this);
  },

  /**
   * Tells the screenreader when this element is expanded or not.
   *
   * @property aria-expanded
   * @private
   */

  'aria-expanded': alias('isOpen'),

  actions: {
    selectOption(value, label) {
      this.sendAction('selectOption', value, label);
    }
  }
});
