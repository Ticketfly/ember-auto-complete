import Ember from 'ember';

const computed = Ember.computed;

export default Ember.Controller.extend({
  testValue: '',

  testOptions: Ember.A([
    {
      value: 'Lennon',
      label: 'John Lennon',
    },
    {
      value: 'McCartney',
      label: 'Paul McCartney',
    },
    {
      value: 'Starr',
      label: 'Ringo Starr',
    },
    {
      value: 'Harrison',
      label: 'George Harrison',
    }
  ]),

  testPromise: computed('testValue', function() {
    const testValue = this.get('testValue');

    return Ember.A(this.get('testOptions').filter(function(option) {
        return option.label.match(new RegExp(testValue, 'g'));
      })
    );
  }),

  testStrings: Ember.A([
    'John Lennon',
    'Paul McCartney',
    'Ringo Starr',
    'George Harrison'
  ]),

  actions: {
    testSelectHandler: function(option) {
      console.log(`${option} selected`);
    }
  }
});
