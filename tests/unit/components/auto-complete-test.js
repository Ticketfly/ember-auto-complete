import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('auto-complete', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
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

test('opens on input', function(assert) {
  assert.expect(1);

  var component = this.subject();

  this.render();

  // Simulate input and check to see that the auto-complete menu opens
  this.$('input').focus().val('test');

  assert.ok(component.get('isOpen'), 'auto-complete list is open');
});

test('opens on focus with input', function(assert) {
  assert.expect(1);

  var component = this.subject({
    value: 'hey jude'
  });

  this.render();

  //focus the input to open the auto-complete menu with a preset input
  this.$('input').focus();

  assert.ok(component.get('isOpen'), 'auto-complete list is open');
});

test('does not open on focus without input', function(assert) {
  assert.expect(1);

  var component = this.subject();

  this.render();

  this.$('input').focus();

  assert.notOk(component.get('isOpen'), 'auto-complete list is not open');
});

test('closes on blur', function(assert) {
  assert.expect(1);

  var component = this.subject({
    value: 'don\'t make it bad'
  });

  this.render();

  this.$('input').focus().blur();

  assert.notOk(component.get('isOpen'), 'auto-complete list is not open');
});

test('closes on escape', function(assert) {
  assert.expect(1);

  var component = this.subject({
    value: 'take a sad song'
  });

  this.render();

  this.$('input').focus().trigger('keypress', { keyCode: 27 });

  assert.notOk(component.get('isOpen'), 'auto-complete list is not open');
});

test('test navigation', function(assert) {
  assert.expect(6);

  var component = this.subject({
    value: 'and make it better',
    options: [
      { name: 'John' },
      { name: 'Paul' },
      { name: 'Ringo' },
      { name: 'Yoko' }
    ]
  });

  this.render();

  this.$('input').focus();

  var options = this.$('.ac-option');

  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  assert.equal(document.activeElement, options[0], 'John is focussed');

  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  assert.equal(document.activeElement, options[1], 'Paul is focussed');

  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  assert.equal(document.activeElement, options[2], 'Ringo is focussed');

  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  assert.equal(document.activeElement, options[1], 'Paul is focussed');

  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  assert.equal(document.activeElement, options[0], 'John is focussed');

  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  assert.equal(document.activeElement, this.$('input'), 'auto-complete is focussed');
});

test('enter selects focused option', function(assert) {
  assert.expect(1);

  var options = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'Ringo' },
    { name: 'Yoko' }
  ];

  var component = this.subject({
    value: 'remember to let her into your heart',
    options: options
  });

  this.render();

  this.$('input').focus();
  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  $(document.activeElement).trigger('keypress', { keyCode: 13 });

  assert.equal(component.get('selected'), options[0], 'John is selected');
});

test('spacebar selects focused option', function(assert) {
  assert.expect(1);

  var options = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'Ringo' },
    { name: 'Yoko' }
  ];

  var component = this.subject({
    value: 'and then you can start',
    options: options
  });

  this.render();

  this.$('input').focus();
  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  $(document.activeElement).trigger('keypress', { keyCode: 13 });

  assert.equal(component.get('selected'), options[0], 'John is selected');
});

test('click selects option', function(assert) {
  assert.expect(1);

  var options = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'Ringo' },
    { name: 'Yoko' }
  ];

  var component = this.subject({
    value: 'to make it better',
    options: options
  });

  this.render();

  this.$('input').focus();
  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  $(document.activeElement).click();

  assert.equal(component.get('selected'), options[0], 'John is selected');
});

test('typing in an open list returns focus to the input', function(assert) {
  assert.expect(1);

  var options = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'Ringo' },
    { name: 'Yoko' }
  ];

  var component = this.subject({
    value: 'hey jude',
    options: options
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
    options: [
      { name: 'John' },
      { name: 'Paul' },
      { name: 'Ringo' },
      { name: 'Yoko' }
    ]
  });

  this.render();

  this.$('input').focus();

  var options = this.$('.ac-option');

  options[2].hover();

  $(document.activeElement).trigger('keypress', { keyCode: 40 });
  assert.equal(document.activeElement, options[3], 'Yoko is focussed');
});

test('aria attributes', function(assert) {
  assert.expect(1);

  var options = [
    { name: 'John' },
    { name: 'Paul' },
    { name: 'Ringo' },
    { name: 'Yoko' }
  ]

  var component = this.subject({
    value: 'don\'t be afraid',
    options: options,
    selected: options[2]
  });

  this.render();

  var input = this.$('input');
  var list = this.$('.ac-options');
  var options = this.$('.ac-option');

  equal(input.attr('role'), 'combobox', 'input role');
  equal(input.attr('aria-autocomplete'), 'both', 'aria-autocomplete');
  equal(input.attr('aria-owns'), list.attr('id'), 'aria-owns');
  equal(input.attr('aria-activedescendant'), options.eq(2).attr('id'), 'aria-activedescendant');

  equal(options.eq(0).attr('role'), 'option', 'option role');

  equal(list.attr('role'), 'listbox', 'list role');
  equal(list.attr('aria-expanded'), 'false', 'aria-expanded');

  input.focus().trigger('keypress', { keyCode: 40 });
  equal(list.attr('aria-expanded'), 'true', 'aria-expanded');
});
