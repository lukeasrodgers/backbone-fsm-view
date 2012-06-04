$(document).ready(function() {
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
    var stub = this.stub(this.view, 'process');
    var e = jQuery.Event('change');
    this.$el.find('input').trigger(e);
    sinon.assert.calledOnce(spy);
	});

});
