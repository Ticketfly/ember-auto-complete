import Ember from 'ember';
import layout from '../templates/components/auto-complete-option';

const computed = Ember.computed;
const alias = computed.alias;

export default Ember.Component.extend({
  layout: layout,

  template: alias('parentView.template'),

  tagName: 'li',

  autoComplete: alias('parentView'),

  attributeBindings: ['role', 'selected', 'tabindex'],

  classNames: ['auto-complete__option'],

  role: 'option',

  selectOption: 'selectOption',

  tabindex: -1,

  /**
   * The resolved label of the option. If the option is an object then the label
   * is provided by the property at `optionLabelPath`. Otherwise the label is
   * the option itself. Must resolve to a string.
   *
   * @property _label
   * @private
   */
  label: alias('content._label'),

  /**
   * The resolved value of the option. If the option is an object then the value
   * is provided by the property at `optionLabelPath`. Otherwise the value is
   * the option itself.
   *
   * @property _label
   * @private
   */
  value: alias('content._value'),

  /**
   * Label formatted to highlight the matched parts of the option.
   *
   * @property _label
   * @private
   */
  formattedLabel: alias('content._formattedLabel'),

  /**
   * Whether or not the option is selected.
   *
   * @property _label
   * @private
   */
  selected: alias('content._selected'),

  click() {
    this.sendAction('selectOption', this.get('value'), this.get('label'));
  },

  mouseEnter() {
    this.$().focus();
  }
});
