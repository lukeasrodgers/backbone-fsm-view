/**
 * @constructor
 */
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
  
  /**
   * Bound to form change events, this function calls `process` with the
   * event name, provided as HTML5 data attribute, and the target
   * element.
   * @param {Event} e
   */
  translateDomEventToFsm: function(e) {
    var eventName = $(e.target).data('eventName');
    this.process(eventName, e.target);
  },

  /**
   * Add a basic transition.
   * Priority: 3.
   * @param {string} action
   * @param {string} state
   * @param {Function} callback
   * @param {string=} nextState if not provided, state will not change
   */
  addTransition: function (action, state, callback, nextState) {
    if (!nextState) {
        nextState = state;
    }
    this.stateTransitions[[action, state]] = [callback, nextState];
  },

  /**
   * Add a transition based on evaluation of form inputValue.
   * Priority: 1 (highest).
   * @param {string} action
   * @param {string} state
   * @param {string|number} inputValue
   * @param {Function} callback
   * @param {string} nextState
   */
  addTransitionEvaluation: function(action, state, inputValue, callback, nextState) {
    this.stateTransitionsEvaluations[[action, state, inputValue]] = [callback, nextState];
  },

  /**
   * Add a transition based on evaluation of form inputValue,
   * triggerable from any state.
   * Priority: 2.
   * @param {string} action
   * @param {string|number} inputValue
   * @param {Function} callback
   * @param {string} nextState
   */
  addTransitionEvaluationAny: function(action, inputValue, callback, nextState) {
    this.stateTransitionsEvaluationsAny[[action, inputValue]] = [callback, nextState];
  },

  /**
   * Add a transition triggerable from any state. 
   * Priority: 4 (lowest).
   * @param {string} action
   * @param {Function} callback
   * @param {string} nextState
   */
  addTransitionAny: function (action, callback, nextState) {
    this.stateTransitionsAny[action] = [callback, nextState];
  },

  /**
   * Called by `process` to determine which transition should occur.
   * @param {string} action
   * @param {string} state
   * @param {Element} domElement
   */
  getTransition: function (action, state, domElement) {
    var $el = $(domElement),
        value;

    if ($el.is(':checkbox') && $el.data('setValue') === 'boolean') {
      value = $el.is(':checked');
    }
    else {
      value = $el.val();
    }

    if (this.stateTransitionsEvaluations[[action, state, value]]) {
      return this.stateTransitionsEvaluations[[action, state, value]];
    }
    else if (this.stateTransitionsEvaluationsAny[[action, value]]) {
      return this.stateTransitionsEvaluationsAny[[action, value]];
    }
    else if (this.stateTransitions[[action, state]]) {
      return this.stateTransitions[[action, state]];
    }
    else if (this.stateTransitionsAny[[action]]) {
      return this.stateTransitionsAny[[action]];
    }
    else {
      throw new Error('Transition is undefined: (' + action + ', ' + state + '), current state: ' + this.currentFsmState);
    }
  },

  /**
   * Handles calling of transition callbacks, state transitioning, and
   * queued events.
   * @param {string} eventName
   * @param {Element} domElement
   */
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

  /**
   * Add an event to the queue, to be executed in order before the next
   * transition.
   * @param {string} action
   * @param {Element} domElement
   */
  addToQueue: function(action, domElement) {
    this.queue.push([action, domElement]);
  }
});
