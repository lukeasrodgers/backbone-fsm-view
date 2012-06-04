var FsmView = Backbone.View.extend({

  events: {
    'change .fsm-event-trigger': 'translateDomEventToFsm'
  },

  initialize: function() {
    _.bindAll(this, 'translateDomEventToFsm');
    this.currentFsmState = 'uninitialized';
    this.stateTransitions = {};
    this.stateTransitionsAny = {};
    this.stateTransitionsEvaluations = {};
    this.stateTransitionsEvaluationsAny = {};
    this.queue = [];
  },

  translateDomEventToFsm: function(e) {
    var eventName = $(e.target).data('eventName');
    this.process(eventName, e.target);
  },

  addTransition: function (action, state, callback, nextState) {
    if (!nextState) {
        nextState = state;
    }
    this.stateTransitions[[action, state]] = [callback, nextState];
  },

  addTransitionEvaluation: function(action, state, inputValue, callback, nextState) {
    this.stateTransitionsEvaluations[[action, state, inputValue]] = [callback, nextState];
  },

  addTransitionEvaluationAny: function(action, inputValue, callback, nextState) {
    this.stateTransitionsEvaluationsAny[[action, inputValue]] = [callback, nextState];
  },

  addTransitionAny: function (action, callback, nextState) {
    this.stateTransitionsAny[action] = [callback, nextState];
  },

  getTransition: function (action, state, domElement) {
    var $el = $(domElement),
        value;

    if ($el.is(':checkbox') && $el.data('setValue') === 'boolean') {
      value = $el.is(':checked');
    }
    else {
      value = $el.val();
    }

    if ( this.stateTransitionsEvaluations[[action, state, value]]) {
      return this.stateTransitionsEvaluations[[action, state, value]];
    }
    else if ( this.stateTransitionsEvaluationsAny[[action, value]]) {
      return this.stateTransitionsEvaluationsAny[[action, value]];
    }
    else if ( this.stateTransitions[[action, state]]) {
      return this.stateTransitions[[action, state]];
    }
    else if ( this.stateTransitionsAny[[action]]) {
      return this.stateTransitionsAny[[action]];
    }
    else {
      throw new Error("Transition is undefined: (" + action + ", " + state + ")");
    }
  },

  process: function (eventName, domElement) {
    var action,
        result = this.getTransition(eventName, this.currentFsmState, domElement);
    action = result[0];

    if (action) {
      action.call(this, domElement);
    }
    if (result[1]) {
      this.currentFsmState = result[1];
    }
    if (this.queue.length > 0) {
      var nextProcess = this.queue.shift();
      this.process(nextProcess[0], nextProcess[1]);
    }
  },

  addToQueue: function(action, domElement) {
    this.queue.push([action, domElement]);
  }
});
