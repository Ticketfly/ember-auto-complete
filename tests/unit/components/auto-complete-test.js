import { test, moduleForComponent } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';

let App;

moduleForComponent('auto-complete', 'AutoComplete', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, 'destroy');
  }
});

test('it renders', function(assert) {
  assert.expect(2);

  // Creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // Renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});

test('opens on focus', function(assert) {
  assert.expect(1);

  var component = this.subject();

  this.render();

  //focus the input to open the auto-complete menu with a preset input
  triggerEvent('input', 'focus');

  andThen(() => {
    assert.ok(component.get('isOpen'), 'auto-complete list is open');
  });
});

test('closes on blur', function(assert) {
  assert.expect(2);

  var component = this.subject();

  this.render();

  triggerEvent('input', 'focus');

  andThen(() => {
    assert.ok(component.get('isOpen'), 'auto-complete list is open');
  });

  triggerEvent('input', 'blur');

  andThen(() => {
    assert.ok(!component.get('isOpen'), 'auto-complete list is not open');
  });
});

test('closes on escape', function(assert) {
  assert.expect(2);

  var component = this.subject();

  this.render();

  triggerEvent('input', 'focus');

  andThen(() => {
    assert.ok(component.get('isOpen'), 'auto-complete list is open');
  });

  andThen(() => {
    keyEvent('input', 'keyDown', 27);
  });

  andThen(() => {
    assert.ok(!component.get('isOpen'), 'auto-complete list is not open');
  });
});

test('test navigation', function(assert) {
  assert.expect(7);

  var component = this.subject({
    content: Ember.A(['John', 'Paul', 'Ringo', 'Yoko'])
  });

  this.render();

  //triggerEvent('input', 'focus');
  click('input');

  andThen(() => {
    assert.ok(component.get('isOpen'), 'auto-complete list is open');

    const options = this.$('.auto-complete__option');

    this.$().trigger({ type: 'keydown', keyCode: 40 });

    assert.equal(document.activeElement, options[0], 'John is focused');

    this.$().trigger({ type: 'keydown', keyCode: 40 });
    this.$().trigger({ type: 'keydown', keyCode: 40 });
    this.$().trigger({ type: 'keydown', keyCode: 40 });
    this.$().trigger({ type: 'keydown', keyCode: 40 });

    assert.equal(document.activeElement, this.$('input')[0], 'auto-complete is focused');
  });
});

test('enter selects focused option', function(assert) {
  assert.expect(1);

  var options = Ember.A(['John', 'Paul', 'Ringo', 'Yoko']);

  var component = this.subject({
    content: options
  });

  this.render();

  this.$('input').focus();
  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  $(document.activeElement).trigger('keypress', { keyCode: 13 });

  assert.equal(component.get('selection'), options[0], 'John is selected');
});

test('spacebar selects focused option', function(assert) {
  assert.expect(1);

  var options = Ember.A(['John', 'Paul', 'Ringo', 'Yoko']);

  var component = this.subject({
    value: 'and then you can start',
    content: options
  });

  this.render();

  this.$('input').focus();
  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  $(document.activeElement).trigger('keypress', { keyCode: 13 });

  assert.equal(component.get('selection'), options[0], 'John is selected');
});

test('click selects option', function(assert) {
  assert.expect(1);

  var options = Ember.A(['John', 'Paul', 'Ringo', 'Yoko']);

  var component = this.subject({
    value: 'to make it better',
    content: options
  });

  this.render();

  Ember.run(() => {
    this.$('input').focus();
    $(document.activeElement).trigger('keypress', { keyCode: 40 });
    $(document.activeElement).click();
  });

  assert.equal(component.get('selection'), options[0], 'John is selected');
});

test('typing in an open list returns focus to the input', function(assert) {
  assert.expect(1);

  var options = Ember.A(['John', 'Paul', 'Ringo', 'Yoko']);

  var component = this.subject({
    value: 'hey jude',
    content: options
  });

  this.render();

  this.$('input').focus();
  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  $(document.activeElement).trigger('keypress', {keyCode: 85});

  assert.equal(document.activeElement, this.$('input'), 'auto-complete is focussed');
});

test('arrows navigate the list from last hover', function(assert) {
  assert.expect(1);

  var component = this.subject({
    value: 'don\'t be afraid',
    content: Ember.A(['John', 'Paul', 'Ringo', 'Yoko'])
  });

  this.render();

  this.$('input').focus();

  var options = this.$('.auto-complete__option');

  options[2].hover();

  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  assert.equal(document.activeElement, options[3], 'Yoko is focussed');
});

test('aria attributes', function(assert) {
  assert.expect(1);

  var options = Ember.A(['John', 'Paul', 'Ringo', 'Yoko']);

  var component = this.subject({
    value: 'don\'t be afraid',
    content: options,
    selected: options[2]
  });

  this.render();

  var input = this.$('input');
  var list = this.$('.auto-complete__options');

  options = this.$('.auto-complete__option');

  assert.equal(input.attr('role'), 'combobox', 'input role');
  assert.equal(input.attr('aria-autocomplete'), 'both', 'aria-autocomplete');
  assert.equal(input.attr('aria-owns'), list.attr('id'), 'aria-owns');
  assert.equal(input.attr('aria-activedescendant'), options.eq(2).attr('id'), 'aria-activedescendant');

  assert.equal(options.eq(0).attr('role'), 'option', 'option role');

  assert.equal(list.attr('role'), 'listbox', 'list role');
  assert.equal(list.attr('aria-expanded'), 'false', 'aria-expanded');

  input.focus().trigger('keypress', { keyCode: 40 });
  assert.equal(list.attr('aria-expanded'), 'true', 'aria-expanded');
});
