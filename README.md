# backbone-fsm-view

A finite state machine view for Backbone.js

## (Somewhat) basic usage

The following code is the skeleton for a view that would conditionally show and hide form elements, and enable a form submission button when a given state has been reached. 

A user will be transitioned from the initial state `initialized` to either the `q1done` state or the `q1q2` state, and so on. 

`addTransitionEvaluationAny` is used to handle cases where the user changes their answer to question 1. It does not specify a new state, but rather in its callback adds a new FSM event to the queue, so that the FSM will handle the user's input correctly.

### javascript

	MyView = FsmView.extend({
		initialize: function() {
			this.addTransition('initialize', 'uninitialized', this.transitionActions.initialize, 'initialized');
			this.addTransitionEvaluation('answerQuestion1', 'initialized', '2', this.transitionActions.done, 'q1done');
			this.addTransitionEvaluation('answerQuestion1', 'initialized', '1', this.transitionActions.q1q2, 'q1q2');
			this.addTransitionEvaluation('answerQuestion2', 'q1q2', 'yes', this.transitionActions.q1q2q3, 'q1q2q3');
			this.addTransitionEvaluation('answerQuestion2', 'q1q2', 'no', this.transitionActions.done, 'q1q2done');
			this.addTransition('answerQuestion3', 'q1q2q3', this.transitionActions.done, 'q1q2q3done');
			this.addTransitionEvaluationAny('answerQuestion1', this.transitionActions.changeQ1Answer);
			this.render();
			this.process('initialize');
		},
		transitionActions: {
			q1q2: function() {
				// reveal question 2
			},
			q1q2q3: function() {
				// reveal question 3
			},
			changeQ1Answer: function() {
				// hide later questions, maybe wipe out answers
				this.addToQueue('answerQuestion1', $('#question1').get(0));
			},
			done: function() {
				// do cleanup, enable submit button
			}
		}
	});

### html

The `fsm-event-trigger` class tells the FSM view to pay attention to this element's change event. The `data-event-name` HTML5 data attribute provides the name for the FSM event.

	<form>
		<div>
			<select class="fsm-event-trigger" name="question-1" data-event-name="answerQuestion1">
				<option value=""></option>
				<option value="1">1</option>
				<option value="2">2</option>
			</select>
		</div>
		<div>
			<select class="fsm-event-trigger hidden" name="question-2" data-event-name="answerQuestion2">
				<option value=""></option>
				<option value="yes">yes</option>
				<option value="no">no</option>
			</select>
		</div>
		<div>
			<input type="text" class="fsm-event-trigger hidden" name="question-3" data-event-name="answerQuestion3">
		</div>
		<div>
			<input type="submit" value="Submit" disabled="disabled" />
		</div>
	</form>
		

## Tests

A test suite (not quite full coverage yet) using qunit and sinon is available in /test.
