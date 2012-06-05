$(document).ready(function() {

  module('initialize', {
    setup: function() {
      this.view = new FsmView();
    }
  });

  test('initializes instance properties correctly', function() {
    strictEqual(this.view.currentFsmState, 'uninitialized');
    deepEqual(this.view.stateTransitions, {});
    deepEqual(this.view.stateTransitionsAny, {});
    deepEqual(this.view.stateTransitionsEvaluations, {});
    deepEqual(this.view.stateTransitionsEvaluationsAny, {});
    deepEqual(this.view.queue, []);
  });

	module('translateDomEventToFsm', {
    setup: function() {
      this.$el = jQuery('<div id="test-div"><input class="fsm-event-trigger" data-event-name="foobar" /></div>');
      this.$el.appendTo('body');
      this.view = new FsmView({el: this.$el});
    },
    teardown: function() {
      $('#test-div').detach();
    }
  });
	
	test('translates a DOM change event into an FSM event', function() {
    var mock = this.mock(this.view, 'process');
    var e = jQuery.Event('change');
    mock.expects('process').once().withExactArgs('foobar', $('.fsm-event-trigger').first().get(0));
    this.$el.find('input').trigger(e);
    ok(mock.verify());
	});

  module('addTransition', {
    setup: function() {
      this.view = new FsmView();
    }
  });

  test('adds a transition to a new state', function() {
    var cb = function() { return; };
    this.view.addTransition('foobar', 'currentstate', cb, 'newstate');
    deepEqual(this.view.stateTransitions[['foobar', 'currentstate']], [cb, 'newstate']);
  });

  test('adds a transition without a new state', function() {
    var cb = function() { return; };
    this.view.addTransition('foobar', 'currentstate', cb);
    deepEqual(this.view.stateTransitions[['foobar', 'currentstate']], [cb, 'currentstate']);
  });

  module('addTransitionEvaluation', {
    setup: function() {
      this.view = new FsmView();
    }
  });

  test('adds a transition based on given value', function() {
    var cb = function() { return; };
    this.view.addTransitionEvaluation('foobar', 'currentstate', 'testval', cb, 'newstate');
    deepEqual(this.view.stateTransitionsEvaluations[['foobar', 'currentstate', 'testval']], [cb, 'newstate']);
  });

  module('addTransitionEvaluationAny', {
    setup: function() {
      this.view = new FsmView();
    }
  });

  test('adds a transition from any state, based on given value', function() {
    var cb = function() { return; };
    this.view.addTransitionEvaluationAny('foobar', 'testval', cb, 'newstate');
    deepEqual(this.view.stateTransitionsEvaluationsAny[['foobar', 'testval']], [cb, 'newstate']);
  });

  module('addTransitionAny', {
    setup: function() {
      this.view = new FsmView();
    }
  });

  test('adds transition from any state', function() {
    var cb = function() { return; };
    this.view.addTransitionAny('foobar', cb, 'newstate');
    deepEqual(this.view.stateTransitionsAny[['foobar']], [cb, 'newstate']);
  });

  module('getTransition', {
    setup: function() {
      this.view = new FsmView();
      this.cb = function() { return; };
    }
  });

  test('returns a transitionAny if it is the only one', function() {
    this.view.addTransitionAny('trigger', this.cb, 'nextstate');
    deepEqual(this.view.getTransition('trigger', 'currentstate'),
              this.view.stateTransitionsAny['trigger']);
  });

  test('returns a transition if it is the only one', function() {
    this.view.addTransition('trigger', 'currentstate', this.cb, 'nextstate');
    deepEqual(this.view.getTransition('trigger', 'currentstate'),
              this.view.stateTransitions[['trigger', 'currentstate']]);
  });

  test('returns a transitionEvaluationAny if it is the only one', function() {
    var el = $('<input type="text" value="inputval" />');
    this.view.addTransitionEvaluationAny('trigger', 'inputval', this.cb, 'nextstate');
    deepEqual(this.view.getTransition('trigger', 'currentstate', el),
              this.view.stateTransitionsEvaluationsAny[['trigger', 'inputval']]);
  });

  test('returns a transitionEvaluation if it is the only one', function() {
    var el = $('<input type="text" value="inputval" />');
    this.view.addTransitionEvaluation('trigger', 'currentstate', 'inputval', this.cb, 'nextstate');
    deepEqual(this.view.getTransition('trigger', 'currentstate', el),
              this.view.stateTransitionsEvaluations[['trigger', 'currentstate', 'inputval']]);
  });

  test('prioritizes transitionEvaluations over other kinds', function() {
    var el = $('<input type="text" value="inputval" />').get(0);
    var cbany = function() { return 1; };
    var cbevalany = function() { return 2; };
    var cbeval = function() { return 3; };
    var cb = function() { return 4; };
    this.view.addTransitionEvaluationAny('trigger', 'inputval', cbevalany, 'nextstate');
    this.view.addTransitionAny('trigger', cbany, 'nextstate');
    this.view.addTransitionEvaluation('trigger', 'currentstate', 'inputval', cbeval, 'nextstate');
    this.view.addTransition('trigger', 'currentstate', cb, 'nextstate');
    deepEqual(this.view.getTransition('trigger', 'currentstate', el),
              this.view.stateTransitionsEvaluations[['trigger', 'currentstate', 'inputval']]);
  });

  test('prioritizes transitionEvaluationAny over other kinds, except transitionEvaluation', function() {
    var el = $('<input type="text" value="inputval" />').get(0);
    var cbany = function() { return 1; };
    var cbevalany = function() { return 2; };
    var cbeval = function() { return 3; };
    var cb = function() { return 4; };
    this.view.addTransitionEvaluationAny('trigger', 'inputval', cbevalany, 'nextstate');
    this.view.addTransitionAny('trigger', cbany, 'nextstate');
    this.view.addTransition('trigger', 'currentstate', cb, 'nextstate');
    deepEqual(this.view.getTransition('trigger', 'currentstate', el),
              this.view.stateTransitionsEvaluationsAny[['trigger', 'inputval']]);
  });

  test('prioritizes transitions over transitionAny', function() {
    var el = $('<input type="text" value="inputval" />').get(0);
    var cbany = function() { return 1; };
    var cbevalany = function() { return 2; };
    var cbeval = function() { return 3; };
    var cb = function() { return 4; };
    this.view.addTransitionAny('trigger', cbany, 'nextstate');
    this.view.addTransition('trigger', 'currentstate', cb, 'nextstate');
    deepEqual(this.view.getTransition('trigger', 'currentstate', el),
              this.view.stateTransitions[['trigger', 'currentstate']]);
  });

  test('throws an error if there are no transition matches', function() {
    var spy = this.spy(this.view, 'getTransition');
    try{
      this.view.getTransition('trigger', 'currentstate');
    }
    catch(err) {}
    sinon.assert.calledOnce(spy);
    sinon.assert.threw(spy);
  });

});
