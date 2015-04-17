import Ember from 'ember';

const computed = Ember.computed;

/**
  @module AutoCompleteOptionProxy

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
export default Ember.ObjectProxy.extend({
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
  _formattedLabel: computed('label', '_autoComplete.regexValue', function() {
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
  _selected: computed('_label', '_autoComplete.value', function() {
    return this.get('_autoComplete.value') === this.get('_label');
  })
});
