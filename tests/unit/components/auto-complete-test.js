import { test, moduleForComponent } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';

let App;

moduleForComponent('auto-complete', 'AutoComplete', {
  needs: ['component:auto-complete-option'],

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
  const component = this.subject();
  assert.equal(component._state, 'preRender');

  // Renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});

test('opens on focus', function(assert) {
  assert.expect(1);

  const component = this.subject();

  this.render();

  //focus the input to open the auto-complete menu with a preset input
  triggerEvent('input', 'focus');

  andThen(() => {
    assert.ok(component.get('isOpen'), 'auto-complete list is open');
  });
});

test('closes on blur', function(assert) {
  assert.expect(2);

  const component = this.subject();

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

  const component = this.subject();

  this.render();

  triggerEvent('input', 'focus');

  andThen(() => {
    assert.ok(component.get('isOpen'), 'auto-complete list is open');
  });

  keyEvent('input', 'keydown', 27);

  andThen(() => {
    assert.ok(!component.get('isOpen'), 'auto-complete list is not open');
  });
});

test('test navigation', function(assert) {
  assert.expect(3);

  const component = this.subject({
    content: Ember.A(['John', 'Paul', 'Ringo', 'Yoko'])
  });

  this.render();


  const options = this.$('.auto-complete__option');

  triggerEvent('input', 'focus');
  keyEvent('input', 'keydown', 40);

  andThen(() => {
    assert.ok(options.eq(0).is(':focus'), 'John is focused');
  });

  andThen(() => {
    keyEvent('input', 'keydown', 40);
    keyEvent('input', 'keydown', 40);
    keyEvent('input', 'keydown', 40);
    keyEvent('input', 'keydown', 40);
  });

  andThen(() => {
    assert.ok($('input').is(':focus'), 'auto-complete is focused');
  });

  andThen(() => {
    keyEvent('input', 'keydown', 38);
    keyEvent('input', 'keydown', 38);
  });

  andThen(() => {
    assert.ok(options.eq(2).is(':focus'), 'Ringo is focused');
  });
});

test('enter selects focused option', function(assert) {
  assert.expect(1);

  var options = Ember.A(['John', 'Paul', 'Ringo', 'Yoko']);

  const component = this.subject({
    content: options
  });

  this.render();

  triggerEvent('input', 'focus');
  keyEvent('input', 'keydown', 40);
  keyEvent('input', 'keydown', 13);

  andThen(() => {
    assert.equal(component.get('selection'), options[0], 'John is selected');
  });
});

test('spacebar selects focused option', function(assert) {
  assert.expect(1);

  var options = Ember.A(['John', 'Paul', 'Ringo', 'Yoko']);

  const component = this.subject({
    content: options
  });

  this.render();

  triggerEvent('input', 'focus');
  keyEvent('input', 'keydown', 40);
  keyEvent('input', 'keydown', 32);

  andThen(() => {
    assert.equal(component.get('selection'), options[0], 'John is selected');
  });
});

test('click selects option', function(assert) {
  assert.expect(1);

  var options = Ember.A(['John', 'Paul', 'Ringo', 'Yoko']);

  const component = this.subject({
    content: options
  });

  this.render();

  triggerEvent('input', 'focus');
  click('.auto-complete__option:first-child');

  andThen(() => {
    assert.equal(component.get('selection'), options[0], 'John is selected');
  });
});

test('typing in an open list returns focus to the input', function(assert) {
  assert.expect(1);

  const component = this.subject({
    content: Ember.A(['John', 'Paul', 'Ringo', 'Yoko'])
  });

  this.render();

  triggerEvent('input', 'focus');
  keyEvent('input', 'keydown', 40);
  keyEvent('input', 'keydown', 85);

  andThen(() => {
    assert.ok(this.$('input').is(':focus'), 'auto-complete is focussed');
  });
});

test('arrows navigate the list from last hover', function(assert) {
  assert.expect(2);

  const component = this.subject({
    content: Ember.A(['John', 'Paul', 'Ringo', 'Yoko'])
  });

  this.render();

  const options = this.$('.auto-complete__option');

  triggerEvent('input', 'focus');
  triggerEvent('.auto-complete__option:first-child', 'mouseenter');

  andThen(() => {
    assert.ok(options.eq(0).is(':focus'), 'Paul is focussed');
  });

  andThen(() => {
    keyEvent('input', 'keydown', 40);
  });

  andThen(() => {
    assert.ok(options.eq(1).is(':focus'), 'Paul is focussed');
  });
});
